<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id',
        'amount',
        'currency',
        'status',
        'notes',
    ];

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }
}
