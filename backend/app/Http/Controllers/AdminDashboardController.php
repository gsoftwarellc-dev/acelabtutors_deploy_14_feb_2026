<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Payout;

class AdminDashboardController extends Controller
{
    private function getStripeSecret()
    {
        $dbKey = DB::table('settings')->where('key', 'STRIPE_SECRET')->value('value');
        if ($dbKey) return $dbKey;

        return env('STRIPE_SECRET');
    }

    public function getStats()
    {
        $stats = [
            'totalRevenue' => '$0.00',
            'thisMonthRevenue' => '$0.00',
            'totalPaidToTutors' => '$0.00',
            'activeTutors' => 0,
            'totalStudents' => 0,
            'stripe_connected' => false
        ];

        // 1. Get User Counts
        $stats['totalStudents'] = User::where('role', 'student')->count();
        $stats['activeTutors'] = User::where('role', 'tutor')->count(); // You might want to filter by 'active' status if you have one

        // 2. Get Stripe Stats
        $secret = $this->getStripeSecret();
        if ($secret) {
            try {
                $stats['stripe_connected'] = true;
                
                // Fetch Recent Charges for "Total Revenue"
                // Ideally this should be cached or aggregated in DB for performance
                $chargesResponse = Http::withToken($secret)->get('https://api.stripe.com/v1/charges?limit=100');
                
                if ($chargesResponse->successful()) {
                    $charges = $chargesResponse->json()['data'];
                    $totalRevenue = 0;
                    $thisMonthRevenue = 0;

                    foreach ($charges as $charge) {
                        if ($charge['paid'] && $charge['status'] === 'succeeded') {
                            $amount = $charge['amount'] / 100;
                            $totalRevenue += $amount;
                            
                            if (date('Y-m', $charge['created']) === date('Y-m')) {
                                $thisMonthRevenue += $amount;
                            }
                        }
                    }

                    $stats['totalRevenue'] = '£' . number_format($totalRevenue, 2);
                    $stats['thisMonthRevenue'] = '£' . number_format($thisMonthRevenue, 2);
                }

                // Calculate Total Paid to Tutors
                $totalPaid = Payout::where('status', 'paid')->sum('amount');
                $stats['totalPaidToTutors'] = '£' . number_format($totalPaid, 2);
                
            } catch (\Exception $e) {
                Log::error('Dashboard Stripe Stats Error: ' . $e->getMessage());
            }
        }

        return response()->json($stats);
    }
}
