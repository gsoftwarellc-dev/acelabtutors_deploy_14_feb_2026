<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentRegistration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type',
        'parent_name',
        'relationship',
        'parent_email',
        'parent_phone',
        'student_name',
        'student_dob',
        'student_email',
        'selections',
        'specific_needs',
        'requested_year',
        'assigned_year',
        'status',
    ];

    protected $casts = [
        'selections' => 'array',
        'student_dob' => 'date',
    ];
}
