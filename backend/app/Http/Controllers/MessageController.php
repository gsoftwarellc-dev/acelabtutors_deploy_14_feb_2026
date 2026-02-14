<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Get list of contacts based on user role
     * - Tutors see: enrolled students + admins
     * - Students see: tutors from enrolled courses + admins
     */
    public function getContacts()
    {
        $user = Auth::user();
        
        if ($user->role === 'tutor') {
            return $this->getTutorContacts($user);
        } elseif ($user->role === 'student') {
            return $this->getStudentContacts($user);
        } elseif ($user->role === 'admin') {
            return $this->getAdminContacts($user);
        } elseif ($user->role === 'parent') {
            return $this->getParentContacts($user);
        }
        
        return response()->json([]);
    }

    /**
     * Get contacts for parents (only admins)
     */
    private function getParentContacts($user)
    {
        // Parents can only message admins
        $admins = User::where('role', 'admin')->get(['id', 'name', 'email', 'role']);
        
        $contacts = $admins->map(function($admin) use ($user) {
            $admin->type = 'admin';
            $admin->course_name = 'Support'; // Admins don't have a specific course context usually, or use 'Support'
            
            $admin->lastMessage = '';
            $admin->time = '';
            $admin->timestamp = null;
            
            // Get last message info
            $lastMsg = Message::where(function($q) use ($user, $admin) {
                $q->where('sender_id', $user->id)->where('receiver_id', $admin->id);
            })->orWhere(function($q) use ($user, $admin) {
                $q->where('sender_id', $admin->id)->where('receiver_id', $user->id);
            })->latest()->first();
            
            if ($lastMsg) {
                $lastMsgContent = $lastMsg->content;
                 if (!$lastMsgContent && $lastMsg->image_path) {
                    $lastMsgContent = '[Image]';
                }
                $admin->lastMessage = $lastMsgContent;
                $admin->time = $lastMsg->created_at->diffForHumans();
            }

            $admin->unread = Message::where('sender_id', $admin->id)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            $admin->timestamp = $lastMsg ? $lastMsg->created_at : null;
            $admin->last_message_sender_id = $lastMsg ? $lastMsg->sender_id : null;
            return $admin;
        });
        
        return response()->json($contacts->sortByDesc('timestamp')->values());
    }

    /**
     * Get contacts for admin (all users)
     */
    private function getAdminContacts($user)
    {
        $users = User::where('id', '!=', $user->id)->get(['id', 'name', 'email', 'role']);

        $contacts = $users->map(function($contact) use ($user) {
            $contact->type = $contact->role;
            
            // Get last message
            $lastMessage = Message::where(function($q) use ($user, $contact) {
                $q->where('sender_id', $user->id)->where('receiver_id', $contact->id);
            })->orWhere(function($q) use ($user, $contact) {
                $q->where('sender_id', $contact->id)->where('receiver_id', $user->id);
            })->latest()->first();

            $contact->lastMessage = $lastMessage ? $lastMessage->content : '';
            $contact->time = $lastMessage ? $lastMessage->created_at->diffForHumans() : '';
            
            $contact->unread = Message::where('sender_id', $contact->id)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();

            // Add raw timestamp for sorting
            $contact->timestamp = $lastMessage ? $lastMessage->created_at : null;
            $contact->last_message_sender_id = $lastMessage ? $lastMessage->sender_id : null;
                
            return $contact;
        });

        // Sort by most recent message
        return response()->json($contacts->sortByDesc('timestamp')->values());
    }

    /**
     * Get contacts for tutors (enrolled students)
     */
    private function getTutorContacts($user)
    {
        // 1. Get Admins
        $admins = User::where('role', 'admin')->get(['id', 'name', 'email', 'role']);
        
        // Add type to each contact
    $contacts = $admins->map(function($admin) use ($user) {
        $admin->type = 'admin';
        $admin->course_name = 'Support';
        $admin->lastMessage = ''; // Default
        $admin->time = '';
        $admin->timestamp = null;
        
        // Get last message info
        $lastMsg = Message::where(function($q) use ($user, $admin) {
            $q->where('sender_id', $user->id)->where('receiver_id', $admin->id);
        })->orWhere(function($q) use ($user, $admin) {
            $q->where('sender_id', $admin->id)->where('receiver_id', $user->id);
        })->latest()->first();
        
        if ($lastMsg) {
            $lastMsgContent = $lastMsg->content;
             if (!$lastMsgContent && $lastMsg->image_path) {
                $lastMsgContent = '[Image]';
            }
            $admin->lastMessage = $lastMsgContent;
            $admin->time = $lastMsg->created_at->diffForHumans();
        }

        $admin->unread = Message::where('sender_id', $admin->id)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();
        
        $admin->timestamp = $lastMsg ? $lastMsg->created_at : null;
        $admin->last_message_sender_id = $lastMsg ? $lastMsg->sender_id : null;
        return $admin;
    });

    return response()->json($contacts->sortByDesc('timestamp')->values());
    }

    /**
     * Get contacts for students (tutors from enrolled courses)
     */
    private function getStudentContacts($user)
    {

        
        // Also include admins for support
        $admins = User::where('role', 'admin')->get(['id', 'name', 'email', 'role']);
        $admins = $admins->map(function($admin) use ($user) {
            $admin->type = 'admin';
            $admin->course_name = 'Support';
            
            $admin->lastMessage = '';
            $admin->time = '';
            $admin->timestamp = null;
             // Get last message info
            $lastMsg = Message::where(function($q) use ($user, $admin) {
                $q->where('sender_id', $user->id)->where('receiver_id', $admin->id);
            })->orWhere(function($q) use ($user, $admin) {
                $q->where('sender_id', $admin->id)->where('receiver_id', $user->id);
            })->latest()->first();
            
            if ($lastMsg) {
                $lastMsgContent = $lastMsg->content;
                 if (!$lastMsgContent && $lastMsg->image_path) {
                    $lastMsgContent = '[Image]';
                }
                $admin->lastMessage = $lastMsgContent;
                $admin->time = $lastMsg->created_at->diffForHumans();
            }

            $admin->unread = Message::where('sender_id', $admin->id)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();
            $admin->unread = Message::where('sender_id', $admin->id)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            $admin->timestamp = $lastMsg ? $lastMsg->created_at : null;
            $admin->last_message_sender_id = $lastMsg ? $lastMsg->sender_id : null;
            return $admin;
        });
        
        return response()->json($admins->sortByDesc('timestamp')->values());
    }

    /**
     * Get messages between current user and a specific contact
     */
    public function getMessages($contactId)
    {
        $userId = Auth::id();

        $messages = Message::where(function($q) use ($userId, $contactId) {
            $q->where('sender_id', $userId)
              ->where('receiver_id', $contactId);
        })->orWhere(function($q) use ($userId, $contactId) {
            $q->where('sender_id', $contactId)
              ->where('receiver_id', $userId);
        })
        ->orderBy('created_at', 'asc')
        ->with(['sender:id,name', 'receiver:id,name']) // Eager load sender/receiver names
        ->get();

        // Transform messages to include full image URL
        $messages = $messages->map(function($msg) {
            if ($msg->image_path) {
                $msg->image_url = asset('storage/' . $msg->image_path);
            }
            return $msg;
        });

        // Mark received messages as read
        Message::where('sender_id', $contactId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    /**
     * Send a new message
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $receiver = User::findOrFail($request->receiver_id);
        $sender = Auth::user();

        // Prevent students from messaging tutors
        if ($sender->role === 'student' && $receiver->role === 'tutor') {
             return response()->json(['error' => 'Students cannot message tutors directly.'], 403);
        }

        // Prevent tutors from messaging students
        if ($sender->role === 'tutor' && $receiver->role === 'student') {
             return response()->json(['error' => 'Tutors cannot message students directly.'], 403);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('messages', 'public');
        }

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
            'image_path' => $imagePath,
            'is_read' => false,
        ]);

        // Add image URL if image was uploaded
        if ($message->image_path) {
            $message->image_url = asset('storage/' . $message->image_path);
        }

        return response()->json($message->load(['sender:id,name', 'receiver:id,name']));
    }

    /**
     * Get total unread message count for current user
     */
    public function getUnreadCount()
    {
        $userId = Auth::id();
        $unreadCount = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();
            
        return response()->json(['unread_count' => $unreadCount]);
    }
}
