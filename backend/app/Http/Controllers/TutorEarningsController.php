<?php

namespace App\Http\Controllers;

use App\Models\TutorPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TutorEarningsController extends Controller
{
    /**
     * Get earnings stats and transaction history for the authenticated tutor
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();

        // Calculate totals
        $totalEarnings = TutorPayment::where('tutor_id', $user->id)->sum('amount');

        $thisMonth = TutorPayment::where('tutor_id', $user->id)
            ->whereMonth('payment_date', $now->month)
            ->whereYear('payment_date', $now->year)
            ->sum('amount');

        $lastMonth = TutorPayment::where('tutor_id', $user->id)
            ->whereMonth('payment_date', $now->copy()->subMonth()->month)
            ->whereYear('payment_date', $now->copy()->subMonth()->year)
            ->sum('amount');

        // Get transaction history (paginated)
        $transactions = TutorPayment::where('tutor_id', $user->id)
            ->with('paidByAdmin:id,name')
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'stats' => [
                'total' => round($totalEarnings, 2),
                'this_month' => round($thisMonth, 2),
                'last_month' => round($lastMonth, 2),
            ],
            'transactions' => $transactions,
        ]);
    }

    /**
     * Admin: Record a payment to a tutor
     */
    public function store(Request $request)
    {
        $request->validate([
            'tutor_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string|in:bank_transfer,cash,cheque,other',
            'reference' => 'nullable|string|max:255',
            'note' => 'nullable|string|max:1000',
            'payment_date' => 'required|date',
        ]);

        $payment = TutorPayment::create([
            'tutor_id' => $request->tutor_id,
            'amount' => $request->amount,
            'method' => $request->method,
            'reference' => $request->reference,
            'note' => $request->note,
            'payment_date' => $request->payment_date,
            'paid_by' => Auth::id(),
        ]);

        return response()->json($payment, 201);
    }
}
