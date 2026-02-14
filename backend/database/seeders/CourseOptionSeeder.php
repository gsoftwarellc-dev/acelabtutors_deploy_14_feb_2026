<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Type of School
        $schoolTypes = ['Primary', 'Secondary', 'College', 'University'];
        foreach ($schoolTypes as $value) {
            \App\Models\CourseOption::firstOrCreate(['type' => 'type_of_school', 'value' => $value]);
        }

        // Year Group
        $years = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'];
        foreach ($years as $value) {
            \App\Models\CourseOption::firstOrCreate(['type' => 'year', 'value' => $value]);
        }

        // Subjects
        $subjects = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History'];
        foreach ($subjects as $value) {
            \App\Models\CourseOption::firstOrCreate(['type' => 'subject', 'value' => $value]);
        }
    }
}
