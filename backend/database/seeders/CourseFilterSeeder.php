<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\User;

class CourseFilterSeeder extends Seeder
{
    public function run()
    {
        // Get the first tutor, or create a dummy one
        $tutor = User::where('role', 'tutor')->first();
        
        if (!$tutor) {
            echo "No tutor found. Please create a tutor account first.\n";
            return;
        }

        $primarySubjects = ['Maths', 'English Language', 'Verbal Reasoning', 'Non-verbal Reasoning'];
        $secondarySubjects = ['Maths', 'Physics', 'Chemistry', 'Biology'];
        $aLevelSubjects = ['Maths', 'Further Maths', 'Chemistry', 'Physics', 'Biology'];

        // Primary School
        $primaryYears = [
            'Primary 2',
            'Year 3',
            'Year 4',
            'Year 5 (11 Plus Prep)',
            'Year 6 (SATS)'
        ];

        foreach ($primaryYears as $year) {
            foreach ($primarySubjects as $subject) {
                Course::firstOrCreate([
                    'tutor_id' => $tutor->id,
                    'subject' => $subject,
                    'year' => $year,
                    'type_of_school' => 'Primary School',
                ], [
                    'name' => "$subject - $year",
                    'description' => "Sample course for $subject in $year",
                    'level' => 'beginner',
                    'status' => 'published',
                    'is_approved' => true,
                    'is_platform_visible' => true,
                    'price' => 25.00,
                ]);
            }
        }

        // Secondary School
        $secondaryYears = [
            'Year 7',
            'Year 8',
            'Year 9',
            'Year 10',
            'Year 11'
        ];

        foreach ($secondaryYears as $year) {
            foreach ($secondarySubjects as $subject) {
                Course::firstOrCreate([
                    'tutor_id' => $tutor->id,
                    'subject' => $subject,
                    'year' => $year,
                    'type_of_school' => 'Secondary School',
                ], [
                    'name' => "$subject - $year",
                    'description' => "Sample course for $subject in $year",
                    'level' => 'intermediate',
                    'status' => 'published',
                    'is_approved' => true,
                    'is_platform_visible' => true,
                    'price' => 30.00,
                ]);
            }
        }

        // A-Levels
        foreach ($aLevelSubjects as $subject) {
            Course::firstOrCreate([
                'tutor_id' => $tutor->id,
                'subject' => $subject,
                'year' => 'A-Levels',
                'type_of_school' => 'College',
            ], [
                'name' => "$subject - A-Levels",
                'description' => "Sample A-Level course for $subject",
                'level' => 'advanced',
                'status' => 'published',
                'is_approved' => true,
                'is_platform_visible' => true,
                'price' => 35.00,
            ]);
        }

        echo "Filter options seeded successfully!\n";
    }
}
