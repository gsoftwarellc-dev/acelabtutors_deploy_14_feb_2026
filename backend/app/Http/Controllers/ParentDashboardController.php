<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Attendance;
use Illuminate\Support\Facades\DB;

class ParentDashboardController extends Controller
{
    /**
     * Search for a child by ID and return their details
     */
    public function searchChild(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer'
        ]);

        $studentId = $request->student_id;

        // 1. Find the student
        $student = User::where('id', $studentId)
            ->where('role', 'student')
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Student not found with this ID.'], 404);
        }

        // 2. key stats
        // Total classes attended (mock logic for now or count from attendance)
        // Average attendance
        // Next class

        // 3. Get Enrollments with Course details
        $enrollments = Enrollment::where('student_id', $studentId)
            ->with(['course.tutor']) // Eager load course and tutor
            ->get();

        $formattedEnrollments = $enrollments->filter(function ($enrollment) {
            return $enrollment->course !== null;
        })->map(function ($enrollment) {
            return [
                'course_id' => $enrollment->course_id,
                'course_name' => $enrollment->course->name,
                'tutor_name' => $enrollment->course->tutor ? $enrollment->course->tutor->name : 'N/A',
                'progress' => $enrollment->progress ?? 0,
                'grade' => $enrollment->grade ?? 'N/A',
                'attendance' => $enrollment->attendance ?? 'N/A',
                'status' => $enrollment->status,
                'next_class' => 'Monday, 10:00 AM' // Mock for demo
            ];
        })->values();

        // 4. Calculate Aggregate Stats
        $totalClasses = $formattedEnrollments->count() * 12; // Mock calculation
        $avgAttendance = '95%'; // Mock

        // 5. Get Class History (Attendance)
        $attendances = Attendance::where('student_id', $studentId)
            ->with('course')
            ->orderBy('date', 'desc')
            ->get();

        $classHistory = $attendances->map(function ($attendance) {
            return [
                'id' => $attendance->id,
                'course_name' => $attendance->course ? $attendance->course->name : 'Unknown Course',
                'date' => $attendance->date,
                'status' => $attendance->status,
            ];
        });

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'joined_at' => $student->created_at->format('F Y'),
            ],
            'stats' => [
                'total_courses' => $formattedEnrollments->count(),
                'total_classes' => $totalClasses,
                'attendance_rate' => $avgAttendance,
            ],
            'enrollments' => $formattedEnrollments,
            'class_history' => $classHistory
        ]);
    }
}
