<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Auth;

class TutorController extends Controller
{
    public function dashboardStats(Request $request)
    {
        // Ideally use Auth::id(), but matching other controllers using ID 2 for demo
        $tutorId = 2; 

        $courses = Course::where('tutor_id', $tutorId)->get();
        $courseCount = $courses->count();
        $courseIds = $courses->pluck('id');

        $totalEnrollments = Enrollment::whereIn('course_id', $courseIds)->count();
        
        // Active students (unique students enrolled in active courses)
        $activeStudents = Enrollment::whereIn('course_id', $courseIds)
                            ->where('status', 'active')
                            ->distinct('student_id')
                            ->count('student_id');

        return response()->json([
            'active_students' => $activeStudents,
            'total_enrollments' => $totalEnrollments,
            'course_count' => $courseCount
        ]);
    }
}
