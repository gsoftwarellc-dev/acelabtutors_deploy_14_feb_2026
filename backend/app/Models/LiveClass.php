<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LiveClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id', 
        'topic', 
        'start_time', 
        'duration', 
        'meeting_link', 
        'recording_url', 
        'materials_path', 
        'status'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
