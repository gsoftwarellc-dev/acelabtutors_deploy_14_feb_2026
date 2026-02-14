<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\UserActivityLog;
use Illuminate\Support\Facades\Auth;

class LogUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only log for authenticated users
        if (Auth::check()) {
            $user = Auth::user();
            $today = now()->toDateString();
            $sessionKey = "visit_logged_{$user->id}_{$today}";

            // Only log once per hour (to avoid logging every API request)
            // This counts as one "visit" or "login session"
            if (!session()->has($sessionKey)) {
                UserActivityLog::create([
                    'user_id' => $user->id,
                    'date' => $today,
                    'activity_type' => 'visit'
                ]);

                // Mark that we logged for this session (expires in 1 hour)
                session()->put($sessionKey, true);
                session()->put("{$sessionKey}_time", now()->timestamp);
            } elseif (session()->has("{$sessionKey}_time")) {
                // Check if an hour has passed
                $lastLog = session()->get("{$sessionKey}_time");
                if (now()->timestamp - $lastLog >= 3600) { // 3600 seconds = 1 hour
                    UserActivityLog::create([
                        'user_id' => $user->id,
                        'date' => $today,
                        'activity_type' => 'visit'
                    ]);
                    session()->put("{$sessionKey}_time", now()->timestamp);
                }
            }
        }

        return $next($request);
    }
}
