<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Google Calendar API and OAuth 2.0 integration.
    | You'll need to create these credentials in Google Cloud Console:
    | https://console.cloud.google.com/apis/credentials
    |
    */

    'client_id' => env('GOOGLE_CLIENT_ID', ''),
    'client_secret' => env('GOOGLE_CLIENT_SECRET', ''),
    'redirect_uri' => env('GOOGLE_REDIRECT_URI', env('APP_URL') . '/api/google/callback'),
    
    'scopes' => [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ],
    
    'application_name' => env('APP_NAME', 'Acelab Tutors'),
];
