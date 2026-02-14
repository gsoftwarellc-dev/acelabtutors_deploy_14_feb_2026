<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationFormOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_type',
        'category',
        'group_name',
        'subjects',
        'sort_order',
    ];

    protected $casts = [
        'subjects' => 'array',
    ];
}
