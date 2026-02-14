<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;

class StudentDashboardController extends Controller
{
    /**
     * Get dashboard data for the authenticated student
     */
    public function getDashboardData(Request $request)
    {
        $user = $request->user();
        
        // Get enrolled courses count
        $enrolledCoursesCount = $user->enrollments()->count();
        
        // Get course IDs that the student is enrolled in
        $enrolledCourseIds = $user->enrollments()->pluck('course_id');
        
        // Get upcoming live_class lessons from enrolled courses
        // Using simpler query with joins
        $upcomingClasses = Lesson::select('lessons.*')
            ->join('chapters', 'lessons.chapter_id', '=', 'chapters.id')
            ->join('courses', 'chapters.course_id', '=', 'courses.id')
            ->where('lessons.type', 'live_class')
            ->where('lessons.start_time', '>', now())
            ->whereIn('courses.id', $enrolledCourseIds)
            ->with(['chapter.course.tutor'])
            ->orderBy('lessons.start_time', 'asc')
            ->limit(10)
            ->get();
        
        $upcomingClassesData = $upcomingClasses->map(function($lesson) {
            return [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'course_name' => $lesson->chapter->course->name ?? 'Unknown Course',
                'tutor_name' => $lesson->chapter->course->tutor->name ?? 'Unknown Tutor',
                'start_time' => $lesson->start_time,
                'duration' => $lesson->duration,
                'meeting_link' => $lesson->meeting_link,
            ];
        });
        
        // Get past lessons (class history) - all types with start_time in the past
        $pastClasses = Lesson::select('lessons.*')
            ->join('chapters', 'lessons.chapter_id', '=', 'chapters.id')
            ->join('courses', 'chapters.course_id', '=', 'courses.id')
            ->where('lessons.start_time', '<', now())
            ->whereNotNull('lessons.start_time')
            ->whereIn('courses.id', $enrolledCourseIds)
            ->with(['chapter.course.tutor'])
            ->orderBy('lessons.start_time', 'desc')
            ->limit(10)
            ->get();
        
        $classHistoryData = $pastClasses->map(function($lesson) {
            return [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'course_name' => $lesson->chapter->course->name ?? 'Unknown Course',
                'tutor_name' => $lesson->chapter->course->tutor->name ?? 'Unknown Tutor',
                'start_time' => $lesson->start_time,
                'duration' => $lesson->duration,
                'status' => 'Completed', // All past classes are completed
            ];
        });
        
        return response()->json([
            'stats' => [
                'enrolled_courses' => $enrolledCoursesCount,
                'attendance' => 0, // TODO: Calculate from class history
                'upcoming_classes' => $upcomingClassesData->count(),
            ],
            'upcoming_classes' => $upcomingClassesData,
            'class_history' => $classHistoryData,
        ]);
    }

}
