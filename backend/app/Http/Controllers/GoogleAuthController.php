<?php

namespace App\Http\Controllers;

use App\Services\GoogleMeetService;
use Illuminate\Http\Request;

class GoogleAuthController extends Controller
{
    protected $googleMeetService;

    public function __construct(GoogleMeetService $googleMeetService)
    {
        $this->googleMeetService = $googleMeetService;
    }

    /**
     * Initiate Google OAuth flow
     */
    public function connect(Request $request)
    {
        $user = $request->user();
        $authUrl = $this->googleMeetService->getAuthUrl($user->id);
        
        return response()->json([
            'auth_url' => $authUrl,
        ]);
    }

    /**
     * Handle OAuth callback from Google
     */
    public function callback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');
        
        if (!$code || !$state) {
            return redirect(env('FRONTEND_URL') . '/tutor/courses?error=oauth_failed');
        }

        try {
            $this->googleMeetService->handleCallback($code, $state);

            return redirect(env('FRONTEND_URL') . '/tutor/courses?google_connected=true');
        } catch (\Exception $e) {
            \Log::error('Google OAuth callback error: ' . $e->getMessage());
            return redirect(env('FRONTEND_URL') . '/tutor/courses?error=oauth_failed');
        }
    }

    /**
     * Get Google connection status
     */
    public function status(Request $request)
    {
        $user = $request->user();
        $status = $this->googleMeetService->getTokenStatus($user);
        $token = \App\Models\GoogleToken::where('user_id', $user->id)->first();

        return response()->json([
            'connected' => $token !== null,
            'google_email' => $token ? $token->google_email : null,
            'status' => $status,
        ]);
    }

    /**
     * Disconnect Google account
     */
    public function disconnect(Request $request)
    {
        $user = $request->user();
        $success = $this->googleMeetService->disconnect($user);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Google account disconnected' : 'Failed to disconnect',
        ]);
    }
}
