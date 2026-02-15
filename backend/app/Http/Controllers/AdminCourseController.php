<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class AdminCourseController extends Controller
{
    /**
     * Get all courses with status 'submitted'
     */
    public function getSubmittedCourses()
    {
        $courses = Course::where('status', 'submitted')
            ->with(['tutor:id,name,email']) // Eager load tutor details
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($courses);
    }

    /**
     * Approve a course
     */
    public function approveCourse($id)
    {
        $course = Course::findOrFail($id);
        
        $course->update([
            'status' => 'published',
            'is_approved' => true
        ]);

        return response()->json([
            'message' => 'Course approved successfully',
            'course' => $course
        ]);
    }

    /**
     * Reject a course
     */
    public function rejectCourse(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        // Optional: Can add a reason for rejection in future or send a message
        // For now, simple status update
        
        $course->update([
            'status' => 'rejected'
        ]);

        return response()->json([
            'message' => 'Course rejected',
            'course' => $course
        ]);
    }

    // Get all courses for control panel
    public function getApprovedCourses()
    {
        $courses = Course::with(['tutor:id,name,email'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($courses);
    }

    // Toggle platform visibility
    public function toggleVisibility($id)
    {
        $course = Course::findOrFail($id);
        
        $course->update([
            'is_platform_visible' => !$course->is_platform_visible
        ]);

        return response()->json([
            'message' => 'Visibility updated',
            'is_platform_visible' => $course->is_platform_visible
        ]);
    }

    // Update course price
    public function updatePrice(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        $request->validate([
            'price' => 'required|numeric|min:0',
            'registration_fee' => 'nullable|numeric|min:0'
        ]);
        
        $course->update([
            'price' => $request->price,
            'registration_fee' => $request->registration_fee
        ]);

        return response()->json([
            'message' => 'Price updated successfully',
            'price' => $course->price,
            'registration_fee' => $course->registration_fee
        ]);
    }

    // Delete a course option (subject, year, type_of_school)
    public function deleteCourseOption(Request $request)
    {
        $request->validate([
            'type' => 'required|in:subject,year,type_of_school',
            'value' => 'required|string'
        ]);

        $type = $request->type;
        $value = $request->value;

        // 1. Remove from CourseOption table
        \App\Models\CourseOption::where('type', $type)->where('value', $value)->delete();

        // 2. Set the field to null for all courses that have this value
        $affectedCount = Course::where($type, $value)->update([$type => null]);

        return response()->json([
            'message' => "Removed '{$value}' from options and {$affectedCount} course(s)",
            'affected_count' => $affectedCount
        ]);
    }

    // Add a new course option
    public function addCourseOption(Request $request)
    {
        $request->validate([
            'type' => 'required|in:subject,year,type_of_school',
            'value' => 'required|string'
        ]);

        // Create or ignore if exists
        $option = \App\Models\CourseOption::firstOrCreate([
            'type' => $request->type,
            'value' => $request->value
        ]);

        return response()->json([
            'message' => "Option '{$request->value}' added successfully",
            'value' => $option->value
        ]);
    }

    // Update/rename a course option
    public function updateCourseOption(Request $request)
    {
        $request->validate([
            'type' => 'required|in:subject,year,type_of_school',
            'old_value' => 'required|string',
            'new_value' => 'required|string'
        ]);

        $type = $request->type;
        $oldValue = $request->old_value;
        $newValue = $request->new_value;

        // 1. Update in CourseOption table
        \App\Models\CourseOption::where('type', $type)
            ->where('value', $oldValue)
            ->update(['value' => $newValue]);

        // 2. Update all courses that have the old value
        $affectedCount = Course::where($type, $oldValue)->update([$type => $newValue]);

        return response()->json([
            'message' => "Updated '{$oldValue}' to '{$newValue}' in options and {$affectedCount} course(s)",
            'affected_count' => $affectedCount
        ]);
    }

    /**
     * Create a new course as an admin
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'registration_fee' => 'nullable|numeric|min:0',
            'type_of_school' => 'nullable|string',
            'year' => 'nullable|string',
            'subjects' => 'nullable|array',
            'subjects.*' => 'string',
            'subject' => 'nullable|string', // Fallback for single subject if sent
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Handle multiple subjects
        $subjects = $request->subjects ? implode(', ', $request->subjects) : $request->subject;

        $course = Course::create([
            'name' => $request->name,
            'price' => $request->price,
            'registration_fee' => $request->registration_fee,
            'type_of_school' => $request->type_of_school,
            'year' => $request->year,
            'subject' => $subjects,
            'tutor_id' => $user->id,
            'level' => 'Beginner',
            'description' => "Administrator created course: {$request->name}",
            'status' => 'published',
            'is_approved' => true,
            'is_platform_visible' => true,
        ]);


        return response()->json([
            'message' => 'Course created successfully',
            'course' => $course
        ], 201);
    }
    /**
     * Update a course
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'registration_fee' => 'nullable|numeric|min:0',
            'type_of_school' => 'nullable|string',
            'year' => 'nullable|string',
            'subjects' => 'nullable|array',
            'subjects.*' => 'string',
            'subject' => 'nullable|string',
        ]);

        // Handle multiple subjects
        $subjectsString = $request->subjects ? implode(', ', $request->subjects) : $request->subject;

        $course->update([
            'name' => $request->name,
            'price' => $request->price,
            'registration_fee' => $request->registration_fee,
            'type_of_school' => $request->type_of_school,
            'year' => $request->year,
            'subject' => $subjectsString,
        ]);

        return response()->json([
            'message' => 'Course updated successfully',
            'course' => $course
        ]);
    }

    /**
     * Delete a course (soft delete)
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully'
        ]);
    }
}



