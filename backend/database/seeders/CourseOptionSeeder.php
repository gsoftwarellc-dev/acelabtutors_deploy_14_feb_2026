<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\CourseOption;

class CourseOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing options to match the requested data exactly
        // We truncate to be safe
        DB::table('course_options')->truncate();

        $subjects = [
            'Maths',
            'English Language',
            'Verbal Reasoning',
            'Non-verbal Reasoning',
            'Physics',
            'Chemistry',
            'Biology',
            'Further Maths',
            'Computer Science',
            'History',
            'Geography',
            'French',
            'Spanish',
            'German',
            'Business Studies',
            'Economics',
            'Psychology',
            'Sociology',
            'Art & Design',
            'Music',
            'Physical Education'
        ];

        $years = [
            'Primary 2',
            'Year 3',
            'Year 4',
            'Year 5 (11 Plus Prep)',
            'Year 6 (SATS)',
            'Year 7',
            'Year 8',
            'Year 9',
            'Year 10',
            'Year 11',
            'A-Levels'
        ];

        $schoolTypes = [
            'Primary School',
            'Secondary School',
            'A-Levels',
            'College',
            'Sixth Form'
        ];

        foreach ($subjects as $subject) {
            CourseOption::firstOrCreate(['type' => 'subject', 'value' => $subject]);
        }

        foreach ($years as $year) {
            CourseOption::firstOrCreate(['type' => 'year', 'value' => $year]);
        }

        foreach ($schoolTypes as $type) {
            CourseOption::firstOrCreate(['type' => 'type_of_school', 'value' => $type]);
        }
    }
}
