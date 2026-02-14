<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FreeFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Clear existing Free Form options
        DB::table('registration_form_options')->where('form_type', 'free')->delete();

        $formType = 'free';

        // 2. Define the structure
        $structure = [
            'SECONDARY SCHOOL (YEAR 8 - 11)' => [
                'YEAR 8' => ['Maths', 'Physics'],
                'YEAR 9' => ['Maths', 'Physics'],
                'YEAR 10' => ['Maths', 'Physics'],
                'YEAR 11' => ['Maths', 'Physics'],
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
