<?php

namespace App\Http\Controllers;

use App\Models\RegistrationFormOption;
use Illuminate\Http\Request;

class RegistrationFormOptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RegistrationFormOption::query();

        if ($request->has('form_type')) {
            $query->where('form_type', $request->form_type);
        }

        return $query->orderBy('sort_order')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_type' => 'required|string|in:free,paid',
            'category' => 'required|string',
            'group_name' => 'required|string',
            'subjects' => 'required|array',
            'sort_order' => 'integer',
        ]);

        return RegistrationFormOption::create($validated);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RegistrationFormOption $registrationFormOption)
    {
        $validated = $request->validate([
            'form_type' => 'string|in:free,paid',
            'category' => 'string',
            'group_name' => 'string',
            'subjects' => 'array',
            'sort_order' => 'integer',
        ]);

        $registrationFormOption->update($validated);

        return $registrationFormOption;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RegistrationFormOption $registrationFormOption)
    {
        $registrationFormOption->delete();

        return response()->noContent();
    }
}
