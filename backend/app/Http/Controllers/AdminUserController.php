<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    // List all users
    public function index()
    {
        return response()->json(User::latest()->get());
    }

    // Get single user details with history
    public function show($id)
    {
        $user = User::with(['enrollments.course', 'payments', 'courses'])->findOrFail($id);
        return response()->json($user);
    }

    // Create new user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,parent,tutor,admin',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    // Update user
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            // Ignore current user id for unique email check
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|in:student,parent,tutor,admin',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    // Delete user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    // Toggle User Suspension
    public function toggleSuspend($id)
    {
        $user = User::findOrFail($id);
        
        $user->status = ($user->status === 'active') ? 'suspended' : 'active';
        $user->save();

        return response()->json(['message' => 'User status updated successfully', 'user' => $user]);
    }

    // Enroll Student in Course
    public function enroll(Request $request, $id)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'grade' => 'nullable|string',
        ]);

        $user = User::findOrFail($id);
        
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can be enrolled in courses.'], 400);
        }

        // Check if already enrolled
        $exists = \App\Models\Enrollment::where('student_id', $user->id)
            ->where('course_id', $request->course_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Student is already enrolled in this course.'], 400);
        }

        \App\Models\Enrollment::create([
            'student_id' => $user->id,
            'course_id' => $request->course_id,
            'enrollment_date' => now(),
            'status' => 'active',
            'grade' => $request->grade,
        ]);

        return response()->json(['message' => 'Student enrolled successfully']);
    }

    // Unenroll Student from Course
    public function unenroll(Request $request, $id, $courseId)
    {
        $user = User::findOrFail($id);
        
        // Find enrollment
        $enrollment = \App\Models\Enrollment::where('student_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Student is not enrolled in this course.'], 404);
        }

        $enrollment->delete();

        return response()->json(['message' => 'Student unenrolled successfully']);
    }

    // Get All Courses (for enrollment dropdown)
    public function getCourses()
    {
        return response()->json(\App\Models\Course::select('id', 'name', 'level')->get());
    }
    // Delete a Course
    public function deleteCourse($id)
    {
        $course = \App\Models\Course::findOrFail($id);
        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }

    // Get User Performance with Attendance Stats
    public function getPerformance($id)
    {
        $user = User::with(['enrollments.course'])->findOrFail($id);

        // Get attendance stats for each enrolled course
        $enrollmentsWithStats = $user->enrollments->map(function ($enrollment) use ($user) {
            $courseId = $enrollment->course->id;
            
            // Count attendance by status
            $attendanceStats = \App\Models\Attendance::where('course_id', $courseId)
                ->where('student_id', $user->id)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            // Total attendance records
            $totalRecords = array_sum($attendanceStats);

            // Get individual attendance records with dates and visit counts
            $attendanceRecords = \App\Models\Attendance::where('course_id', $courseId)
                ->where('student_id', $user->id)
                ->orderBy('date', 'desc')
                ->get()
                ->map(function ($record) use ($user) {
                    // Count visits on this date (using DATE() for proper comparison)
                    $visitCount = \App\Models\UserActivityLog::where('user_id', $user->id)
                        ->whereRaw('DATE(date) = ?', [$record->date])
                        ->where('activity_type', 'visit')
                        ->count();

                    return [
                        'date' => $record->date,
                        'status' => $record->status,
                        'visits' => $visitCount,
                    ];
                });

            return [
                'course_id' => $enrollment->course->id,
                'course_name' => $enrollment->course->name,
                'course_level' => $enrollment->course->level,
                'enrollment_date' => $enrollment->enrollment_date,
                'status' => $enrollment->status,
                'attendance_stats' => [
                    'present' => $attendanceStats['present'] ?? 0,
                    'absent' => $attendanceStats['absent'] ?? 0,
                    'late' => $attendanceStats['late'] ?? 0,
                    'excused' => $attendanceStats['excused'] ?? 0,
                    'total' => $totalRecords,
                ],
                'attendance_records' => $attendanceRecords,
            ];
        });

        // Get daily visit log (grouped by date)
        $dailyVisits = \App\Models\UserActivityLog::where('user_id', $user->id)
            ->where('activity_type', 'visit')
            ->selectRaw('DATE(date) as visit_date, COUNT(*) as visit_count')
            ->groupByRaw('DATE(date)')
            ->orderByRaw('DATE(date) DESC')
            ->get()
            ->map(function ($row) {
                return [
                    'date' => $row->visit_date,
                    'visits' => $row->visit_count,
                ];
            });

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
            ],
            'enrollments' => $enrollmentsWithStats,
            'daily_visits' => $dailyVisits,
        ]);
    }
}
