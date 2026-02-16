<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class TutorFinanceController extends Controller
{
    /**
     * Get the Stripe Connect OAuth URL for the tutor to link their account.
     */
    public function getLink(Request $request)
    {
        $clientId = env('STRIPE_CLIENT_ID');
        if (!$clientId) {
            return response()->json(['error' => 'Stripe Client ID not configured.'], 500);
        }

        $redirectUri = env('FRONTEND_URL', 'https://acelabtutors.co.uk') . '/tutor/finance/callback';
        
        // standard connect
        $url = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id={$clientId}&scope=read_write&redirect_uri={$redirectUri}";

        return response()->json(['url' => $url]);
    }

    /**
     * Exchange the authorization code for a connected account ID.
     */
    public function connectCallback(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $secretKey = env('STRIPE_SECRET');
        if (!$secretKey) {
            return response()->json(['success' => false, 'message' => 'Stripe Secret Key not configured.'], 500);
        }

        try {
            $response = Http::asForm()->post('https://connect.stripe.com/oauth/token', [
                'client_secret' => $secretKey,
                'code' => $request->code,
                'grant_type' => 'authorization_code',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $stripeAccountId = $data['stripe_user_id'];

                $user = $request->user();
                $user->stripe_account_id = $stripeAccountId;
                $user->stripe_boarding_completed = true;
                $user->save();

                return response()->json(['success' => true]);
            } else {
                Log::error('Stripe Connect Error: ' . $response->body());
                return response()->json(['success' => false, 'message' => $response->json()['error_description'] ?? 'Result failed'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Stripe OAuth Exception: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get financial stats for the connected tutor.
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        if (!$user->stripe_account_id) {
            return response()->json([
                'connected' => false,
                'stats' => [
                    'totalRevenue' => '$0.00',
                    'thisMonth' => '$0.00',
                    'pending' => '$0.00',
                    'available' => '$0.00'
                ]
            ]);
        }

        $secretKey = env('STRIPE_SECRET');
        if (!$secretKey) {
             return response()->json(['connected' => true, 'error' => 'Stripe Not Configured']);
        }

        try {
            // Fetch Balance regarding this connected account
            // We must use the Stripe-Account header to get data FOR that account
            $balanceResponse = Http::withToken($secretKey)
                ->withHeaders(['Stripe-Account' => $user->stripe_account_id])
                ->get('https://api.stripe.com/v1/balance');
            
            $available = 0;
            $pending = 0;

            if ($balanceResponse->successful()) {
                $balanceData = $balanceResponse->json();
                $available = collect($balanceData['available'])->sum('amount') / 100;
                $pending = collect($balanceData['pending'])->sum('amount') / 100;
            }

            // Fetch Charges/Transfers implementation would go here
            // For now, returning balance as the primary stat
            
            return response()->json([
                'connected' => true,
                'stats' => [
                    'totalRevenue' => '$' . number_format($available + $pending, 2), // Rough estimate
                    'thisMonth' => '$0.00', // Needs more complex query
                    'pending' => '$' . number_format($pending, 2),
                    'available' => '$' . number_format($available, 2)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe Stats Error: ' . $e->getMessage());
            return response()->json(['connected' => true, 'error' => 'Failed to fetch stats'], 500);
        }
    }
}
