<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TutorPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id',
        'amount',
        'method',
        'reference',
        'note',
        'payment_date',
        'paid_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function paidByAdmin()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }
}
