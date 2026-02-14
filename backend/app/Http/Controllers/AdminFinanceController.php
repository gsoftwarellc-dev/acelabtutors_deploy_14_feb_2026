<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Payout;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Course;

class AdminFinanceController extends Controller
{
    private function getStripeSecret()
    {
        $dbKey = DB::table('settings')->where('key', 'STRIPE_SECRET')->value('value');
        if ($dbKey) return $dbKey;

        return env('STRIPE_SECRET');
    }

    public function getStats()
    {
        $secret = $this->getStripeSecret();
        if (!$secret) {
            return response()->json([
                'connected' => false,
                'stats' => [
                    'totalRevenue' => '$0.00',
                    'thisMonth' => '$0.00',
                    'pending' => '$0.00',
                    'paid' => '$0.00'
                ]
            ], 200);
        }

        try {
            // Fetch Balance
            $balanceResponse = Http::withToken($secret)->get('https://api.stripe.com/v1/balance');
            
            if ($balanceResponse->failed()) {
                 return response()->json(['connected' => false], 200);
            }
            
            $balanceData = $balanceResponse->json();
            $available = collect($balanceData['available'])->sum('amount') / 100;
            $pending = collect($balanceData['pending'])->sum('amount') / 100;

            // Fetch Recent Charges for "Total Revenue" (simplified)
            // In a real app we might aggregate from DB or deeper Stripe API usage
            $chargesResponse = Http::withToken($secret)->get('https://api.stripe.com/v1/charges?limit=100');
            $totalRevenue = 0;
            $thisMonthRevenue = 0;
            
            if ($chargesResponse->successful()) {
                $charges = $chargesResponse->json()['data'];
                foreach ($charges as $charge) {
                    if ($charge['paid'] && $charge['status'] === 'succeeded') {
                        $amount = $charge['amount'] / 100;
                        $totalRevenue += $amount;
                        
                        // Check if this month
                        if (date('Y-m', $charge['created']) === date('Y-m')) {
                            $thisMonthRevenue += $amount;
                        }
                    }
                }
            }

            return response()->json([
                'connected' => true,
                'stats' => [
                    'totalRevenue' => '$' . number_format($totalRevenue, 2),
                    'thisMonth' => '$' . number_format($thisMonthRevenue, 2),
                    'pending' => '$' . number_format($pending, 2),
                    'paid' => '$' . number_format($available, 2) // Using available balance as "Paid/Settled" proxy
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe Stats Error: ' . $e->getMessage());
            return response()->json(['connected' => false], 200);
        }
    }

    public function getTransactions()
    {
        $transactions = [];

        // 1. Fetch Stripe Charges (Incoming)
        $secret = $this->getStripeSecret();
        if ($secret) {
            try {
                $response = Http::withToken($secret)->get('https://api.stripe.com/v1/charges?limit=20');
                if ($response->successful()) {
                    $charges = $response->json()['data'];
                    foreach ($charges as $charge) {
                        $chargeId = $charge['id'];
                        $paymentIntentId = $charge['payment_intent'];
                        
                        // Try to find internal payer name and phone
                        $internalPayer = null;
                        if (!empty($charge['billing_details']['email'])) {
                            $internalPayer = User::where('email', $charge['billing_details']['email'])->first();
                        }
                        
                        $payerName = $charge['billing_details']['name'] ?? ($internalPayer ? $internalPayer->name : 'N/A');
                        $payerPhone = $internalPayer ? $internalPayer->phone : 'N/A';
                        
                        // Try to find purchased courses via Payment or Enrollment
                        // We check for both the Charge ID and the PI ID for robust linking
                        $internalPayment = Payment::where(function($query) use ($chargeId, $paymentIntentId) {
                            $query->where('payment_intent_id', $chargeId);
                            if ($paymentIntentId) {
                                $query->orWhere('payment_intent_id', $paymentIntentId);
                            }
                        })->first();

                        // Fallback 1: match by user email + amount (for registered users with session ID)
                        if (!$internalPayment && $internalPayer) {
                            $chargeAmount = $charge['amount'] / 100;
                            $internalPayment = Payment::where('user_id', $internalPayer->id)
                                ->where('amount', $chargeAmount)
                                ->whereRaw("payment_intent_id LIKE 'cs_%'")
                                ->orderBy('created_at', 'desc')
                                ->first();
                        }

                        // Fallback 2: match for GUEST checkouts by amount + buyer_name
                        if (!$internalPayment) {
                            $chargeAmount = $charge['amount'] / 100;
                            $billingName = $charge['billing_details']['name'] ?? null;
                            if ($billingName) {
                                $internalPayment = Payment::whereNull('user_id')
                                    ->where('amount', $chargeAmount)
                                    ->where('buyer_name', $billingName)
                                    ->whereRaw("payment_intent_id LIKE 'cs_%'")
                                    ->orderBy('created_at', 'desc')
                                    ->first();
                            }
                        }

                        // Auto-heal: update the stored cs_ ID to the real pi_ ID for future lookups
                        if ($internalPayment && str_starts_with($internalPayment->payment_intent_id, 'cs_') && $paymentIntentId) {
                            $internalPayment->update(['payment_intent_id' => $paymentIntentId]);
                        }

                        $courseNames = [];
                        $years = [];
                        
                        // Strategy 1: Check Stripe charge/PI metadata for course_ids (future transactions)
                        if (!empty($charge['metadata']['course_ids'])) {
                            try {
                                $metaCourseIds = json_decode($charge['metadata']['course_ids'], true);
                                if (json_last_error() === JSON_ERROR_NONE && is_array($metaCourseIds)) {
                                    $courses = Course::whereIn('id', $metaCourseIds)->get();
                                    $courseNames = $courses->pluck('name')->toArray();
                                    $years = $courses->pluck('year')->filter()->unique()->toArray();
                                }
                            } catch (\Throwable $e) {
                                Log::error('Failed to parse course_ids from charge metadata: ' . $e->getMessage());
                            }
                        }

                        // Strategy 2: Use internal Payment record description
                        if (empty($courseNames) && $internalPayment) {
                            // Prefer stored buyer info from checkout form
                            if ($internalPayment->buyer_name) {
                                $payerName = $internalPayment->buyer_name;
                            }
                            if ($internalPayment->buyer_phone) {
                                $payerPhone = $internalPayment->buyer_phone;
                            }

                            $description = $internalPayment->description;
                            if (str_starts_with($description, 'Course Enrollment: ')) {
                                $courseNameStr = str_replace('Course Enrollment: ', '', $description);
                                $courseNames = [$courseNameStr]; // Treat as single course name (may be a package name)
                                try {
                                    $matchedCourses = Course::where('name', $courseNameStr)->get();
                                    if ($matchedCourses->isEmpty()) {
                                        // Try splitting by comma for multi-course enrollments
                                        $splitNames = explode(', ', $courseNameStr);
                                        $matchedCourses = Course::whereIn('name', $splitNames)->get();
                                        if ($matchedCourses->isNotEmpty()) {
                                            $courseNames = $matchedCourses->pluck('name')->toArray();
                                        }
                                    }
                                    $years = $matchedCourses->pluck('year')->filter()->unique()->toArray();
                                } catch (\Exception $e) {
                                    $years = [];
                                }
                            }
                        } elseif (empty($courseNames)) {
                            // Strategy 3: Stripe Session API lookup (last resort)
                            if ($paymentIntentId) {
                                try {
                                    $sessionsResp = Http::withToken($secret)->get("https://api.stripe.com/v1/checkout/sessions?payment_intent={$paymentIntentId}&limit=1");
                                    if ($sessionsResp->successful()) {
                                        $sessions = $sessionsResp->json()['data'] ?? [];
                                        if (!empty($sessions) && !empty($sessions[0]['metadata']['course_ids'])) {
                                            $metaCourseIds = json_decode($sessions[0]['metadata']['course_ids'], true);
                                            if (json_last_error() === JSON_ERROR_NONE && is_array($metaCourseIds)) {
                                                $courses = Course::whereIn('id', $metaCourseIds)->get();
                                                $courseNames = $courses->pluck('name')->toArray();
                                                $years = $courses->pluck('year')->filter()->unique()->toArray();
                                            }
                                        }
                                    }
                                } catch (\Throwable $e) {
                                    Log::error('Failed Stripe session lookup: ' . $e->getMessage());
                                }
                            }

                            // Strategy 4: Enrollment table fallback
                            if (empty($courseNames)) {
                                $enrollments = Enrollment::whereIn('payment_id', array_filter([$chargeId, $paymentIntentId]))
                                    ->with('course')
                                    ->get();
                                
                                $courseNames = $enrollments->pluck('course.name')->unique()->toArray();
                                try {
                                    $years = $enrollments->pluck('course.year')->unique()->filter()->toArray();
                                } catch (\Exception $e) {
                                    $years = [];
                                }
                            }
                        }

                        $transactions[] = [
                            'id' => $charge['id'],
                            'amount' => number_format($charge['amount'] / 100, 2),
                            'currency' => strtoupper($charge['currency']),
                            'status' => $charge['status'] === 'succeeded' ? 'Paid' : 'Failed',
                            'date' => $charge['created'], // Timestamp
                            'description' => $charge['description'] ?? 'Payment',
                            'type' => 'incoming', // Incoming payment
                            'payer' => $payerName,
                            'email' => $charge['billing_details']['email'] ?? 'N/A',
                            'phone' => $payerPhone,
                            'courses' => $courseNames, // Array of course names
                            'year_groups' => isset($years) ? $years : [], // Array of year groups
                            'formatted_date' => date('M d, Y H:i', $charge['created'])
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::error('AdminFinance Transactions Error (Stripe): ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            }
        }

        // 2. Fetch Payouts (Outgoing)
        try {
            $payouts = Payout::with('tutor')->latest()->get();
            foreach ($payouts as $payout) {
                $transactions[] = [
                    'id' => 'PAY-' . $payout->id,
                    'amount' => number_format($payout->amount, 2),
                    'currency' => strtoupper($payout->currency),
                    'status' => ucfirst($payout->status),
                    'date' => $payout->created_at->timestamp,
                    'description' => 'Payout to ' . ($payout->tutor->name ?? 'Tutor'),
                    'type' => 'outgoing', // Outgoing payment
                    'payer' => 'Admin', // Payer is us
                    'payee' => $payout->tutor->name ?? 'Unknown Tutor',
                    'email' => $payout->tutor->email ?? 'N/A',
                    'phone' => $payout->tutor->phone ?? 'N/A',
                    'courses' => [],
                    'formatted_date' => $payout->created_at->format('M d, Y H:i')
                ];
            }
        } catch (\Throwable $e) {
            Log::error('AdminFinance Transactions Error (Payouts): ' . $e->getMessage());
        }

        // 3. Sort by Date Descending
        usort($transactions, function ($a, $b) {
            return $b['date'] <=> $a['date'];
        });

        return response()->json($transactions);
    }

    public function getTutors()
    {
        $tutors = User::where('role', 'tutor')->select('id', 'name', 'email')->get();
        return response()->json($tutors);
    }

    public function storePayout(Request $request)
    {
        $request->validate([
            'tutor_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'notes' => 'nullable|string'
        ]);

        $payout = Payout::create([
            'tutor_id' => $request->tutor_id,
            'amount' => $request->amount,
            'currency' => $request->currency,
            'status' => 'paid', // Admin manual record is assumed paid externally
            'notes' => $request->notes
        ]);

        return response()->json(['success' => true, 'payout' => $payout]);
    }

    public function getConnectUrl()
    {
        $clientId = env('STRIPE_CLIENT_ID');
        if (!$clientId) {
            return response()->json(['error' => 'Stripe Client ID not configured.'], 500);
        }

        // Redirect to frontend page
        $redirectUri = env('NEXT_PUBLIC_APP_URL', 'http://localhost:3000') . '/admin/finance';
        
        $url = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id={$clientId}&scope=read_write&redirect_uri={$redirectUri}";

        return response()->json(['url' => $url]);
    }

    public function exchangeCode(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        
        $secretKey = env('STRIPE_SECRET'); // We need the platform's secret key to exchange the code?
                                           // actually for Standard accounts, we exchange the code using our platform's secret key
        
        // Wait, if the user IS the admin, they are connecting THEIR account TO this app.
        // This app (the codebase) IS the software.
        // This flow usually implies there is a "Platform" (SaaS) and "Users".
        // If this is a self-hosted single-tenant app, "Connect" is slightly odd unless it's a "Standard" OAuth into a specific Platform App (like "Wordpress for Stripe").
        // Assuming the user has created a generic "Platform" in Stripe Dashboard just to get a Client ID.
        
        try {
             $response = Http::asForm()->post('https://connect.stripe.com/oauth/token', [
                'client_secret' => env('STRIPE_SECRET'), // The Platform's Secret Key
                'code' => $request->code,
                'grant_type' => 'authorization_code',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // For a single-tenant app acting as its own platform:
                // We save these credentials to be used for future API calls.
                // $data['stripe_user_id'] is the connected account ID.
                $this->updateEnv([
                    'STRIPE_ACCOUNT_ID' => $data['stripe_user_id'],
                    // If it's a Standard account, we might just use the account_id with our platform key?
                    // Or we get an access_token?
                    // Standard accounts: response has 'access_token', 'refresh_token', 'stripe_publishable_key', 'stripe_user_id'
                    'STRIPE_KEY' => $data['stripe_publishable_key'],
                    'STRIPE_ACCESS_TOKEN' => $data['access_token'], // Save this if we want to act AS them
                    // 'STRIPE_SECRET' => ... standard flow gives an access token, use that instead of SK?
                ]);
                
                // IMPORTANT: In standard Connect, the access_token REPLACES the secret key for API calls on behalf of that user.
                // We should probably save it as STRIPE_SECRET or a new env var and update getStripeSecret to prefer it.
                
                // Let's save as STRIPE_SECRET for simplicity in this single-tenant context, 
                // OR add logic to getStripeSecret to use STRIPE_ACCESS_TOKEN if present.
                
                 $this->updateEnv([
                    'STRIPE_KEY' => $data['stripe_publishable_key'],
                    'STRIPE_SECRET' => $data['access_token'], // Use the access token as the secret for API calls
                    'STRIPE_ACCOUNT_ID' => $data['stripe_user_id'],
                ]);

                return response()->json(['success' => true]);
            } else {
                 return response()->json(['success' => false, 'message' => $response->json()['error_description'] ?? 'Result failed'], 400);
            }

        } catch (\Exception $e) {
            Log::error('Stripe OAuth Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()], 500);
        }
    }

    public function storeStripeConfig(Request $request)
    {
        $request->validate([
            'client_id' => 'required|string|starts_with:ca_',
            'secret_key' => 'nullable|string|starts_with:sk_',
            'publishable_key' => 'nullable|string|starts_with:pk_',
            'webhook_secret' => 'nullable|string|starts_with:whsec_',
        ]);

        $data = ['STRIPE_CLIENT_ID' => $request->client_id];
        
        if ($request->filled('secret_key')) {
            $data['STRIPE_SECRET'] = $request->secret_key;
        }
        
        if ($request->filled('publishable_key')) {
            $data['STRIPE_KEY'] = $request->publishable_key;
        }

        if ($request->filled('webhook_secret')) {
            $data['STRIPE_WEBHOOK_SECRET'] = $request->webhook_secret;
        }

        $this->updateEnv($data);

        return response()->json(['success' => true]);
    }
    
    // Keep legacy manual connect for now, or just leave it.
    public function connectStripe(Request $request)
    {
         // ... existing manual logic ...
         // We can leave it or overwrite it if we want to enforce OAuth.
         // Let's overwrite since we are changing the flow.
         return $this->exchangeCode($request);
    }
    
    public function createPaymentLink(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.50',
            'currency' => 'required|string|size:3',
            'description' => 'required|string|max:255',
        ]);

        $secret = $this->getStripeSecret();
        if (!$secret) {
            return response()->json(['error' => 'Stripe is not connected.'], 400);
        }

        try {
            \Stripe\Stripe::setApiKey($secret);

            // Create Product
            $product = \Stripe\Product::create([
                'name' => $request->description,
            ]);

            // Create Price
            $price = \Stripe\Price::create([
                'product' => $product->id,
                'unit_amount' => (int) ($request->amount * 100),
                'currency' => 'gbp',
            ]);

            // Create Payment Link
            $paymentLink = \Stripe\PaymentLink::create([
                'line_items' => [
                    [
                        'price' => $price->id,
                        'quantity' => 1,
                    ],
                ],
            ]);

            return response()->json(['url' => $paymentLink->url]);

        } catch (\Exception $e) {
            Log::error('Stripe Payment Link Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create payment link: ' . $e->getMessage()], 500);
        }
    }

    private function updateEnv($data)
    {
        $path = base_path('.env');
        if (file_exists($path)) {
            $fileContent = file_get_contents($path);
            
            foreach ($data as $key => $value) {
                // Wrap value in quotes if it contains spaces
                if (strpos($value, ' ') !== false) {
                    $value = '"' . $value . '"';
                }
                
                if (preg_match("/^{$key}=/m", $fileContent)) {
                    // Update existing key
                    $fileContent = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $fileContent);
                } else {
                    // check if last character is newline
                    if (substr($fileContent, -1) !== "\n") {
                        $fileContent .= "\n";
                    }
                    // Append new key
                    $fileContent .= "{$key}={$value}\n";
                }
            }
            
            file_put_contents($path, $fileContent);
        }
    }
}
