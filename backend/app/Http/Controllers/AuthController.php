<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Register attempt:', $request->all());
        
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,tutor,parent,admin',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role' => $validatedData['role'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        // Handle base64 upload
        if ($request->has('avatar') && is_string($request->avatar) && str_starts_with($request->avatar, 'data:image')) {
            $avatarData = $request->avatar;
            if (preg_match('/^data:image\/(\w+);base64,/', $avatarData, $type)) {
                $avatarData = substr($avatarData, strpos($avatarData, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, gif
                $avatarData = base64_decode($avatarData);

                if ($avatarData === false) {
                    return response()->json(['message' => 'Base64 decode failed'], 400);
                }

                $avatarName = time() . '_' . uniqid() . '.' . $type;
                if (!file_exists(public_path('avatars'))) {
                    mkdir(public_path('avatars'), 0755, true);
                }
                file_put_contents(public_path('avatars') . '/' . $avatarName, $avatarData);

                $user->avatar = '/avatars/' . $avatarName;
                $user->save();

                return response()->json([
                    'message' => 'Avatar updated successfully',
                    'avatar_url' => $user->avatar,
                    'user' => $user
                ]);
            }
        }

        // Handle file upload
        if ($request->hasFile('avatar')) {
            try {
                $request->validate([
                    'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB
                ]);

                $avatarName = time().'.'.$request->avatar->extension();
                $request->avatar->move(public_path('avatars'), $avatarName);

                $user->avatar = '/avatars/' . $avatarName;
                $user->save();

                return response()->json([
                    'message' => 'Avatar updated successfully',
                    'avatar_url' => $user->avatar,
                    'user' => $user
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Avatar upload failed: ' . $e->getMessage());
                return response()->json(['message' => 'Avatar upload failed: ' . $e->getMessage()], 422);
            }
        }

        return response()->json(['message' => 'No avatar data provided'], 400);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password does not match'
            ], 422);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }
}
