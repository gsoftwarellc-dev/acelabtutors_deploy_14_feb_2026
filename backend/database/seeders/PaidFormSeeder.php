<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaidFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Clear existing Paid Form options
        DB::table('registration_form_options')->where('form_type', 'paid')->delete();

        $formType = 'paid';

        // 2. Define the structure
        $structure = [
            'PRIMARY SCHOOL CLASSES' => [
                'PRIMARY 2' => ['Maths', 'English Language'],
                'YEAR 3' => ['Maths', 'English Language'],
                'YEAR 4' => ['Maths', 'English Language', 'Verbal Reasoning'],
                'YEAR 5 (11 PLUS PREP)' => ['Maths', 'English Language', 'Verbal Reasoning', 'Non-verbal Reasoning'],
                'YEAR 6 (SATS)' => ['Maths', 'English Language'],
            ],
            'SECONDARY SCHOOL' => [
                'YEAR 7' => ['Maths', 'Physics', 'Chemistry', 'Biology'],
                'YEAR 8' => ['Maths', 'Physics', 'Chemistry', 'Biology'],
                'YEAR 9' => ['Maths', 'Physics', 'Chemistry', 'Biology'],
                'YEAR 10' => ['Maths', 'Physics', 'Chemistry', 'Biology'],
                'YEAR 11' => ['Maths', 'Physics', 'Chemistry', 'Biology'],
            ],
            'A-LEVELS' => [
                'YEAR 12 - 13' => ['Maths', 'Further Maths', 'Chemistry', 'Physics', 'Biology'],
            ],
        ];

        // 3. Insert Data
        $now = now();
        $payload = [];

        foreach ($structure as $category => $groups) {
            foreach ($groups as $groupName => $subjects) {
                // Determine order for groups (simple index-based)
                // Since this array is ordered, insertion order is roughly preserved by ID auto-increment.
                
                $payload[] = [
                    'form_type' => $formType,
                    'category' => $category,
                    'group_name' => $groupName,
                    'subjects' => json_encode($subjects),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('registration_form_options')->insert($payload);
    }
}
