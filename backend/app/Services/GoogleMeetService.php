<?php

namespace App\Services;

use App\Models\GoogleToken;
use App\Models\User;
use Google_Client;
use Google_Service_Calendar;
use Google_Service_Calendar_Event;
use Google_Service_Calendar_EventDateTime;
use Google_Service_Calendar_ConferenceSolutionKey;
use Google_Service_Calendar_CreateConferenceRequest;
use Google_Service_Calendar_ConferenceData;
use Carbon\Carbon;
use Illuminate\Support\Str;

class GoogleMeetService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Google_Client();
        $this->client->setApplicationName(config('google-api.application_name'));
        $this->client->setScopes(config('google-api.scopes'));
        $this->client->setClientId(config('google-api.client_id'));
        $this->client->setClientSecret(config('google-api.client_secret'));
        $this->client->setRedirectUri(config('google-api.redirect_uri'));
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    /**
     * Get the Google OAuth authorization URL
     */
    public function getAuthUrl(int $userId): string
    {
        // Include user ID in state to retrieve after OAuth callback
        $state = base64_encode(json_encode(['user_id' => $userId]));
        $this->client->setState($state);
        return $this->client->createAuthUrl();
    }

    /**
     * Handle OAuth callback and store tokens
     */
    public function handleCallback(string $code, string $state): GoogleToken
    {
        // Decode state to get user ID
        $stateData = json_decode(base64_decode($state), true);
        if (!isset($stateData['user_id'])) {
            throw new \Exception('Invalid OAuth state - missing user ID');
        }
        
        $userId = $stateData['user_id'];
        
        // Debug logging
        \Log::info('OAuth callback - Client config:', [
            'client_id' => $this->client->getClientId(),
            'redirect_uri' => $this->client->getRedirectUri(),
            'user_id' => $userId,
        ]);
        
        $token = $this->client->fetchAccessTokenWithAuthCode($code);
        
        if (isset($token['error'])) {
            \Log::error('Token exchange error:', $token);
            throw new \Exception('Error fetching access token: ' . $token['error']);
        }

        $this->client->setAccessToken($token['access_token']);
        $oauth2 = new \Google\Service\Oauth2($this->client);
        $userInfo = $oauth2->userinfo->get();
        $googleEmail = $userInfo->email;

        return GoogleToken::updateOrCreate(
            ['user_id' => $userId],
            [
                'google_email' => $googleEmail,
                'access_token' => $token['access_token'],
                'refresh_token' => $token['refresh_token'] ?? null,
                'expires_at' => Carbon::now()->addSeconds($token['expires_in']),
            ]
        );
    }

    /**
     * Check if user has connected Google account
     */
    public function isConnected(User $user): bool
    {
        return GoogleToken::where('user_id', $user->id)->exists();
    }

    /**
     * Get user's Google token status
     */
    public function getTokenStatus(User $user): ?array
    {
        $token = GoogleToken::where('user_id', $user->id)->first();
        
        if (!$token) {
            return null;
        }

        return [
            'connected' => true,
            'expires_at' => $token->expires_at,
            'is_expired' => $token->isExpired(),
        ];
    }

    /**
     * Refresh access token if expired
     */
    public function refreshAccessToken(User $user): GoogleToken
    {
        $tokenModel = GoogleToken::where('user_id', $user->id)->firstOrFail();

        $this->client->setAccessToken($tokenModel->access_token);
        
        if ($this->client->isAccessTokenExpired()) {
            if (!$tokenModel->refresh_token) {
                throw new \Exception('No refresh token available. User needs to re-authenticate.');
            }

            $this->client->fetchAccessTokenWithRefreshToken($tokenModel->refresh_token);
            $newToken = $this->client->getAccessToken();

            $tokenModel->update([
                'access_token' => $newToken['access_token'],
                'expires_at' => Carbon::now()->addSeconds($newToken['expires_in']),
            ]);
        }

        return $tokenModel;
    }

    /**
     * Create an instant Google Meet
     */
    public function createInstantMeeting(User $user, string $title, string $description = ''): array
    {
        $tokenModel = $this->refreshAccessToken($user);
        $this->client->setAccessToken($tokenModel->access_token);

        $service = new Google_Service_Calendar($this->client);

        // Create event for right now, lasting 1 hour
        $start = Carbon::now();
        $end = $start->copy()->addHour();

        return $this->createMeetingEvent($service, $title, $description, $start, $end);
    }

    /**
     * Create a scheduled Google Meet
     */
    public function createScheduledMeeting(
        User $user,
        string $title,
        Carbon $startTime,
        int $durationMinutes,
        string $description = '',
        array $attendeeEmails = [],
        string $timezone = 'UTC'
    ): array {
        $tokenModel = $this->refreshAccessToken($user);
        $this->client->setAccessToken($tokenModel->access_token);

        $service = new Google_Service_Calendar($this->client);

        $endTime = $startTime->copy()->addMinutes($durationMinutes);

        return $this->createMeetingEvent($service, $title, $description, $startTime, $endTime, $attendeeEmails, $timezone);
    }

    /**
     * Create the actual calendar event with Google Meet
     */
    protected function createMeetingEvent(
        Google_Service_Calendar $service,
        string $title,
        string $description,
        Carbon $start,
        Carbon $end,
        array $attendeeEmails = [],
        string $timezone = 'UTC'
    ): array {
        $eventData = [
            'summary' => $title,
            'description' => $description,
            'start' => [
                'dateTime' => $start->toRfc3339String(),
                'timeZone' => $timezone,
            ],
            'end' => [
                'dateTime' => $end->toRfc3339String(),
                'timeZone' => $timezone,
            ],
            'conferenceData' => [
                'createRequest' => [
                    'requestId' => Str::uuid()->toString(),
                    'conferenceSolutionKey' => [
                        'type' => 'hangoutsMeet'
                    ],
                ],
            ],
        ];
        
        // Always add the tutor themselves as an attendee to ensure they are recognized as a host/participant
        $tutorToken = GoogleToken::where('access_token', $service->getClient()->getAccessToken()['access_token'])->first();
        if ($tutorToken && $tutorToken->google_email) {
            $attendeeEmails[] = $tutorToken->google_email;
        }

        // Add attendees if provided
        if (!empty($attendeeEmails)) {
            $eventData['attendees'] = array_map(function($email) {
                return ['email' => $email, 'responseStatus' => 'accepted'];
            }, array_unique($attendeeEmails));
        }
        
        $event = new Google_Service_Calendar_Event($eventData);

        // Send invites to attendees if any exist
        $insertParams = ['conferenceDataVersion' => 1];
        if (!empty($attendeeEmails)) {
            $insertParams['sendUpdates'] = 'all'; // Send calendar invites to all attendees
        }
        
        $createdEvent = $service->events->insert(
            'primary',
            $event,
            $insertParams
        );

        return [
            'event_id' => $createdEvent->getId(),
            'meeting_link' => $createdEvent->hangoutLink ?? $createdEvent->getConferenceData()?->getEntryPoints()[0]->getUri(),
            'start_time' => $start,
            'end_time' => $end,
        ];
    }

    /**
     * Delete a Google Calendar event
     */
    public function deleteMeeting(User $user, string $eventId): bool
    {
        try {
            $tokenModel = $this->refreshAccessToken($user);
            $this->client->setAccessToken($tokenModel->access_token);

            $service = new Google_Service_Calendar($this->client);
            $service->events->delete('primary', $eventId);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to delete Google Meet: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Disconnect Google account
     */
    public function disconnect(User $user): bool
    {
        return GoogleToken::where('user_id', $user->id)->delete() > 0;
    }
}
