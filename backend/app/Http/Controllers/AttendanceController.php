<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\User;

class AttendanceController extends Controller
{
    // Get attendance sheet for a specific date
    public function index(Request $request, $courseId)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $date = $request->date;
        $course = Course::findOrFail($courseId);

        // Get all enrolled students
        $students = $course->enrollments()->with('student')->get()->map(function ($enrollment) {
            return $enrollment->student;
        });

        // Get attendance records for this date
        $attendanceRecords = Attendance::where('course_id', $courseId)
            ->where('date', $date)
            ->get()
            ->keyBy('student_id');

        // Merge attendance status into students list
        $data = $students->map(function ($student) use ($attendanceRecords) {
            $record = $attendanceRecords->get($student->id);
            return [
                'student_id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'avatar' => $student->avatar,
                'status' => $record ? $record->status : null, // null means not recorded yet
            ];
        });

        return response()->json($data);
    }

    // Save attendance for a date
    public function store(Request $request, $courseId)
    {
        $request->validate([
            'date' => 'required|date',
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:users,id',
            'attendance.*.status' => 'required|in:present,absent,late,excused',
        ]);

        $date = $request->date;

        foreach ($request->attendance as $item) {
            Attendance::updateOrCreate(
                [
                    'course_id' => $courseId,
                    'student_id' => $item['student_id'],
                    'date' => $date,
                ],
                [
                    'status' => $item['status']
                ]
            );
        }

        return response()->json(['message' => 'Attendance saved successfully']);
    }
}
