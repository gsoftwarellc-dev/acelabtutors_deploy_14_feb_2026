<?php

namespace App\Http\Controllers;

use App\Models\StudentRegistration;
use Illuminate\Http\Request;

class StudentRegistrationController extends Controller
{
    /**
     * Display a listing of the resource for admin.
     */
    public function index()
    {
        return response()->json(StudentRegistration::latest()->get());
    }

    /**
     * Store a newly created resource in storage (Public Access).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:free,paid',
            'parent_name' => 'required|string|max:255',
            'relationship' => 'nullable|string|max:255',
            'parent_email' => 'required|email|max:255',
            'parent_phone' => 'required|string|max:255',
            'student_name' => 'required|string|max:255',
            'student_dob' => 'required|date',
            'student_email' => 'nullable|email|max:255',
            'selections' => 'required|array',
            'specific_needs' => 'nullable|string',
        ]);

        $registration = StudentRegistration::create($validated);

        return response()->json([
            'message' => 'Registration submitted successfully',
            'data' => $registration
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $registration = StudentRegistration::findOrFail($id);

        $validated = $request->validate([
            'parent_name' => 'sometimes|string|max:255',
            'parent_email' => 'sometimes|email|max:255',
            'parent_phone' => 'sometimes|string|max:255',
            'student_name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:pending,approved,rejected',
            'selections' => 'sometimes|array',
            'specific_needs' => 'nullable|string',
        ]);

        $registration->update($validated);

        return response()->json([
            'message' => 'Registration updated successfully',
            'data' => $registration
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $registration = StudentRegistration::findOrFail($id);
        $registration->delete();

        return response()->json(['message' => 'Registration deleted successfully']);
    }
}
