<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'payment_intent_id',
        'amount',
        'description',
        'status',
        'payment_date',
        'buyer_name',
        'buyer_phone',
    ];
}
