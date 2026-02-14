<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationFormSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_type',
        'title',
        'subtitle',
        'alert_text',
        'helper_text',
    ];
}
