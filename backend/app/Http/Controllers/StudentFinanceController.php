<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

class StudentFinanceController extends Controller
{
    protected function getStripeSecret()
    {
        try {
            $dbKey = \Illuminate\Support\Facades\DB::table('settings')->where('key', 'STRIPE_SECRET')->value('value');
            if ($dbKey) return $dbKey;
        } catch (\Exception $e) {
            // Fallback
        }

        return config('services.stripe.secret') ?? env('STRIPE_SECRET');
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:courses,id',
            'buyer_name' => 'required|string|max:255',
            'buyer_phone' => 'required|string|max:50',
        ]);

        $user = $request->user(); // Can be null now
        $courseIds = array_column($request->items, 'id');
        $courses = Course::whereIn('id', $courseIds)->get();

        if ($courses->isEmpty()) {
            return response()->json(['message' => 'No valid courses found'], 400);
        }

        $stripeSecret = $this->getStripeSecret();
        if (!$stripeSecret) {
            return response()->json(['message' => 'Stripe is not configured'], 500);
        }

        Stripe::setApiKey($stripeSecret);

        $lineItems = [];
        foreach ($courses as $course) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'gbp',
                    'product_data' => [
                        'name' => $course->name,
                        'description' => "Instructor: " . ($course->tutor->name ?? 'Tutor'),
                    ],
                    'unit_amount' => max(50, (int) (($course->price + ($course->registration_fee ?? 0)) * 100)), // Ensure min 50p for Stripe
                ],
                'quantity' => 1,
            ];
        }

        try {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            
            $metadataPayload = [
                'course_ids' => json_encode($courseIds),
                'type' => 'course_enrollment',
                'buyer_name' => $request->buyer_name,
                'buyer_phone' => $request->buyer_phone,
            ];

            $sessionParams = [
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $frontendUrl . '/order-confirmation?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $frontendUrl . '/courses?canceled=true',
                'metadata' => $metadataPayload,
                'payment_intent_data' => [
                    'metadata' => $metadataPayload, // Propagate to PaymentIntent & Charge
                ],
                'expand' => ['payment_intent'],
            ];

            if ($user) {
                $sessionParams['customer_email'] = $user->email;
                $sessionParams['metadata']['user_id'] = $user->id;
            } else {
                // For guests, we don't set customer_email on session creation unless we ask for it separately
                // or we could use a dummy email if Stripe requires it, but usually not strict for checkout sessions in test mode
            }

            $session = Session::create($sessionParams);

            // Create Payment record immediately so admin can see buyer info & courses
            $courseNamesList = $courses->pluck('name')->toArray();
            $totalAmount = $courses->sum(function ($course) {
                return $course->price + ($course->registration_fee ?? 0);
            });

            $paymentIntentId = $session->id;
            if (!empty($session->payment_intent)) {
                if (is_string($session->payment_intent)) {
                    $paymentIntentId = $session->payment_intent;
                } elseif (isset($session->payment_intent->id)) {
                    $paymentIntentId = $session->payment_intent->id;
                }
            }

            Payment::create([
                'user_id' => $user ? $user->id : null,
                'payment_intent_id' => $paymentIntentId, // Prefer PI ID if available
                'amount' => $totalAmount,
                'description' => 'Course Enrollment: ' . implode(', ', $courseNamesList),
                'status' => 'pending',
                'payment_date' => now(),
                'buyer_name' => $request->buyer_name,
                'buyer_phone' => $request->buyer_phone,
            ]);

            return response()->json(['url' => $session->url]);

        } catch (\Exception $e) {
            Log::error("Stripe Checkout Error: " . $e->getMessage());
            return response()->json(['message' => 'Checkout failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = null;
        try {
            $endpoint_secret = \Illuminate\Support\Facades\DB::table('settings')->where('key', 'STRIPE_WEBHOOK_SECRET')->value('value');
        } catch (\Exception $e) {}

        if (!$endpoint_secret) {
            $endpoint_secret = config('services.stripe.webhook_secret') ?? env('STRIPE_WEBHOOK_SECRET');
        }

        try {
            $event = Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch(\UnexpectedValueException $e) {
            // Invalid payload
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        // Handle the event
        if ($event->type == 'checkout.session.completed') {
            $session = $event->data->object;
            $this->handleCheckoutSessionCompleted($session);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handleCheckoutSessionCompleted($session)
    {
        $metadata = $session->metadata;

        if (isset($metadata->type) && $metadata->type === 'course_enrollment') {
            $userId = $metadata->user_id ?? null; // Allow null for guests
            $courseIds = json_decode($metadata->course_ids, true);

            if (!empty($courseIds)) {
                // Only create enrollments if we have a user
                if ($userId) {
                    foreach ($courseIds as $courseId) {
                        // Check if already enrolled
                        $exists = Enrollment::where('student_id', $userId)
                            ->where('course_id', $courseId)
                            ->exists();

                        if (!$exists) {
                            Enrollment::create([
                                'student_id' => $userId,
                                'course_id' => $courseId,
                                'enrollment_date' => now(),
                                'status' => 'active',
                                'progress' => 0,
                                'payment_id' => $session->payment_intent ?? $session->id,
                                'amount_paid' => $session->amount_total / 100, // Approximate per-course split not exact here, total stored
                                'currency' => $session->currency
                            ]);
                        }
                    }
                    
                    Log::info("Enrolled user $userId in courses: " . implode(',', $courseIds));
                } else {
                     Log::info("Guest checkout for courses: " . implode(',', $courseIds));
                }

                // Create a Payment record for internal audit
                $paymentIntentId = $session->payment_intent ?? $session->id;
                
                // Check if we have an existing record with Session ID (cs_...) and update it to PI ID
                if ($session->payment_intent && $session->id) {
                    $existing = Payment::where('payment_intent_id', $session->id)->first();
                    if ($existing) {
                        $existing->update(['payment_intent_id' => $session->payment_intent]);
                    }
                }

                Payment::updateOrCreate(
                    ['payment_intent_id' => $session->payment_intent ?? $session->id],
                    [
                        'user_id' => $userId, // Can be null
                        'amount' => $session->amount_total / 100,
                        'description' => 'Course Enrollment: ' . implode(', ', Course::whereIn('id', $courseIds)->pluck('name')->toArray()),
                        'status' => 'paid',
                        'payment_date' => now(),
                        'buyer_name' => $metadata->buyer_name ?? null,
                        'buyer_phone' => $metadata->buyer_phone ?? null,
                    ]
                );
            }
        }
    }

    public function getOrderDetails(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        $stripeSecret = $this->getStripeSecret();
        if (!$stripeSecret) {
            return response()->json(['message' => 'Stripe is not configured'], 500);
        }

        Stripe::setApiKey($stripeSecret);

        try {
            $session = Session::retrieve($request->session_id);
            $paymentIntentId = $session->payment_intent;
            
            // Retrieve Payment record from our DB
            $payment = Payment::where('payment_intent_id', $paymentIntentId)->first();

            if (!$payment) {
                // Return basic info from session if DB record not ready yet (webhook delay)
                 $metadata = $session->metadata;
                 $courseIds = json_decode($metadata->course_ids, true);
                 $courses = Course::whereIn('id', $courseIds)->get();
                 
                 return response()->json([
                    'order_id' => $session->id,
                    'date' => date('Y-m-d H:i:s', $session->created),
                    'total_amount' => $session->amount_total / 100,
                    'currency' => strtoupper($session->currency),
                    'buyer_name' => $metadata->buyer_name ?? 'Guest',
                    'buyer_phone' => $metadata->buyer_phone ?? 'N/A',
                    'items' => $courses->map(function($course) {
                        return [
                            'name' => $course->name,
                            'year' => $course->year,
                            'price' => $course->price + ($course->registration_fee ?? 0),
                        ];
                    }),
                    'status' => $session->payment_status,
                ]);
            }

            // For DB record, we need to reconstruct items from description or duplicate logic if we want full details
            // Since description is a string, and we might want structured data, we might need to fetch courses linked to this payment.
            // The Payment model doesn't strictly link to courses except via string description or parsing.
            // However, we can try to fetch Enrollments linked to this payment if they exist.
            
            $enrollments = Enrollment::where('payment_id', $payment->payment_intent_id)->with('course')->get();
            $items = $enrollments->map(function($enrollment) {
                return [
                    'name' => $enrollment->course->name,
                    'year' => $enrollment->course->year,
                    'price' => $enrollment->amount_paid, // Or course price
                ];
            });
            
            // Fallback if no enrollments (e.g. guest with delayed enrollment creation or strictly payment record)
            if ($items->isEmpty()) {
                 // Try to parse course names from description? Or just return description.
                 // Better: Store course_ids in payment metadata or use the existing description.
                 // For now, let's just return the description if items are empty.
            }

            return response()->json([
                'order_id' => $payment->id,
                'payment_intent_id' => $payment->payment_intent_id,
                'date' => $payment->created_at->format('Y-m-d H:i:s'),
                'total_amount' => $payment->amount,
                'currency' => 'GBP',
                'buyer_name' => $payment->buyer_name,
                'buyer_phone' => $payment->buyer_phone,
                'items' => $items->isNotEmpty() ? $items : [],
                'items_description' => $payment->description,
                'status' => $payment->status,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to retrieve order details', 'error' => $e->getMessage()], 500);
        }
    }
}
