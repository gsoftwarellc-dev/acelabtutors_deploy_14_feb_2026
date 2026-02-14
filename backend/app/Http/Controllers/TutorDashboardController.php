<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use Illuminate\Http\Request;

class TutorDashboardController extends Controller
{
    /**
     * Get dashboard statistics for the logged-in tutor
     */
    public function getDashboardStats(Request $request)
    {
        $tutorId = $request->user()->id;
        
        // Get tutor's courses
        $courseIds = Course::where('tutor_id', $tutorId)->pluck('id');
        
        // Active students (unique enrolled students)
        $activeStudents = Enrollment::whereIn('course_id', $courseIds)
            ->distinct('user_id')
            ->count('user_id');
        
        // Total enrollments
        $totalEnrollments = Enrollment::whereIn('course_id', $courseIds)->count();
        
        // Course count
        $courseCount = $courseIds->count();
        
        return response()->json([
            'active_students' => $activeStudents,
            'total_enrollments' => $totalEnrollments,
            'course_count' => $courseCount,
        ]);
    }
    
    /**
     * Get upcoming scheduled classes for the logged-in tutor
     */
    public function getUpcomingClasses(Request $request)
    {
        $tutorId = $request->user()->id;
        
        $upcomingClasses = Lesson::select('lessons.*')
            ->join('chapters', 'lessons.chapter_id', '=', 'chapters.id')
            ->join('courses', 'chapters.course_id', '=', 'courses.id')
            ->where('courses.tutor_id', $tutorId)
            ->where('lessons.type', 'live_class')
            ->where('lessons.start_time', '>=', now())
            ->orderBy('lessons.start_time', 'asc')
            ->with(['chapter.course'])
            ->limit(5) // Limit to next 5 upcoming classes for the dashboard
            ->get();
        
        return response()->json($upcomingClasses->map(function($lesson) {
            return [
                'id' => $lesson->id,
                'time' => $lesson->start_time->format('M d, H:i'), // Format includes Date now
                'course_name' => $lesson->chapter->course->name ?? 'Unknown Course',
                'meeting_link' => $lesson->meeting_link,
                'start_time' => $lesson->start_time->toIso8601String(),
            ];
        }));
    }
}
