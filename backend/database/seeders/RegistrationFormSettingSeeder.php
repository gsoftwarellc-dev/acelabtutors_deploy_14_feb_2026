<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\RegistrationFormSetting;

class RegistrationFormSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Clear existing settings
        RegistrationFormSetting::truncate();

        // 2. Paid Form Defaults (from register-paid/page.tsx)
        RegistrationFormSetting::create([
            'form_type' => 'paid',
            'title' => 'Acelab Tutors',
            'subtitle' => 'Student Registration',
            'alert_text' => '', // Paid form doesn't seem to have a red alert text like Free form
            'helper_text' => 'Please complete the form below to register your student. Fields marked with * are required.',
        ]);

        // 3. Free Form Defaults (from register-free/page.tsx)
        RegistrationFormSetting::create([
            'form_type' => 'free',
            'title' => 'Winners Kingdom Children',
            'subtitle' => 'Free Class Registration (Year 8-11)',
            'alert_text' => 'Free Classes - SATURDAYS ONLY',
            'helper_text' => 'Winners Kingdom Children free classes are available for Maths and Sciences only.',
        ]);
    }
}
