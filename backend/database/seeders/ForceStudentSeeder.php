<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Attendance;

class ForceStudentSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Student with ID 100
        $student = User::updateOrCreate(['id' => 100], [
            'name' => 'Test Student',
            'email' => 'test100@student.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        // 2. Create Tutor
        $tutor = User::updateOrCreate(['email' => 'tutor@test.com'], [
            'name' => 'Test Tutor',
            'password' => Hash::make('password'),
            'role' => 'tutor',
        ]);

        // 3. Create Course
        $course = Course::create([
            'name' => 'Test Course 101',
            'tutor_id' => $tutor->id,
            'level' => 'Beginner',
            'description' => 'Test Course Description',
        ]);

        // 4. Enroll Student
        Enrollment::updateOrCreate(
            ['student_id' => $student->id, 'course_id' => $course->id],
            [
                'enrollment_date' => now(),
                'status' => 'active',
                'attendance' => '99%',
                'grade' => 'A+',
                'progress' => 75,
            ]
        );

        // 5. Create Attendance History
        $dates = [
            now()->subDays(10)->format('Y-m-d'),
            now()->subDays(7)->format('Y-m-d'),
            now()->subDays(3)->format('Y-m-d'),
        ];

        foreach ($dates as $date) {
            Attendance::updateOrCreate(
                ['student_id' => $student->id, 'course_id' => $course->id, 'date' => $date],
                ['status' => 'present']
            );
        }
        
        $this->command->info('Created/Updated Student ID: ' . $student->id . ' with Attendance History');
    }
}
