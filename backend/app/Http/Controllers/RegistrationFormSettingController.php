<?php

namespace App\Http\Controllers;

use App\Models\RegistrationFormSetting;
use Illuminate\Http\Request;

class RegistrationFormSettingController extends Controller
{
    /**
     * Get settings for a specific form type
     */
    public function show($form_type)
    {
        if (!in_array($form_type, ['free', 'paid'])) {
            return response()->json(['message' => 'Invalid form type'], 400);
        }

        $setting = RegistrationFormSetting::where('form_type', $form_type)->first();

        if (!$setting) {
            // Return defaults if not found (though seeder should have handled this)
            return response()->json([
                'form_type' => $request->form_type,
                'title' => '',
                'subtitle' => '',
                'alert_text' => '',
                'helper_text' => ''
            ]);
        }

        return response()->json($setting);
    }

    /**
     * Update settings for a specific form type
     */
    public function update(Request $request)
    {
        $request->validate([
            'form_type' => 'required|in:free,paid',
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'alert_text' => 'nullable|string',
            'helper_text' => 'nullable|string',
        ]);

        $setting = RegistrationFormSetting::updateOrCreate(
            ['form_type' => $request->form_type],
            [
                'title' => $request->title ?? '',
                'subtitle' => $request->subtitle ?? '',
                'alert_text' => $request->alert_text ?? '',
                'helper_text' => $request->helper_text ?? '',
            ]
        );

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $setting
        ]);
    }
}
