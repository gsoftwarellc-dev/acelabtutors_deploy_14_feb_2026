<?php

namespace App\Http\Controllers;

use App\Models\CourseOption;
use Illuminate\Http\Request;

class CourseOptionsController extends Controller
{
    public function index()
    {
        // Fetch values from the dedicated CourseOption table
        $subjects = CourseOption::where('type', 'subject')->orderBy('value')->pluck('value');
        $years = CourseOption::where('type', 'year')->orderBy('value')->pluck('value');
        $schoolTypes = CourseOption::where('type', 'type_of_school')->orderBy('value')->pluck('value');

        return response()->json([
            'subjects' => $subjects,
            'years' => $years,
            'types_of_school' => $schoolTypes,
        ]);
    }
}
