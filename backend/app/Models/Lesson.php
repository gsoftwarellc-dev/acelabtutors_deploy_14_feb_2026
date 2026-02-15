<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $casts = [
        'start_time' => 'datetime',
    ];

    protected $fillable = [
        'chapter_id', 
        'title', 
        'type', 
        'content', 
        'file_path', 
        'order', 
        'is_free',
        'meeting_link',
        'start_time',
        'duration',
        'status'
    ];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}
