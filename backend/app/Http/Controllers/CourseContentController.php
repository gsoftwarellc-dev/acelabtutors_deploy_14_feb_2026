<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Chapter;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseContentController extends Controller
{
    // Get full curriculum for a course
    public function index($courseId)
    {
        $course = Course::withTrashed()->with(['chapters.lessons'])->findOrFail($courseId);
        return response()->json($course->chapters);
    }

    // Get all courses for the authenticated tutor
    public function getCourses(Request $request)
    {
        // Get authenticated  user's tutor_id
        $tutorId = $request->user() ? $request->user()->id : 1; // Fallback to 1 if no auth
        $query = Course::where('tutor_id', $tutorId);

        if ($request->get('filter') === 'trash') {
            $query->onlyTrashed();
        }

        $courses = $query->withCount('enrollments') // Assuming relationship exists
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($courses);
    }

    // Update course details (e.g. status)
    public function updateCourse(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        $request->validate([
            'status' => 'sometimes|in:draft,published,hidden,submitted,rejected',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type_of_school' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
        ]);

        $updates = $request->only(['status', 'name', 'description', 'type_of_school', 'year', 'subject']);

        // Tutors cannot set prices; force to 0 for learning-only courses
        $updates['price'] = 0;
        $updates['registration_fee'] = 0;

        // Auto-approve when tutor publishes
        if (isset($updates['status']) && $updates['status'] === 'published') {
            $updates['is_approved'] = true;
        }

        $course->update($updates);

        return response()->json($course);
    }

    // Delete a course
    public function deleteCourse($id)
    {
        $course = Course::findOrFail($id);
        
        // Delete related files (lessons, etc.) if needing manually, 
        // but robust apps rely on cascade or model events. 
        // For now, we just delete the course record.
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }

    // Restore a soft-deleted course
    public function restoreCourse($id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        $course->restore();
        return response()->json(['message' => 'Course restored successfully']);
    }

    // Permanently delete a course
    public function forceDeleteCourse($id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        $course->forceDelete();
        return response()->json(['message' => 'Course permanently deleted']);
    }

    // Create a new course
    public function storeCourse(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type_of_school' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
        ]);

        // Use authenticated user's ID as tutor_id
        $tutorId = $request->user() ? $request->user()->id : 1; // Fallback to 1 if no auth
        
        $course = Course::create([
            'name' => $request->name,
            'description' => $request->description,
            'tutor_id' => $tutorId, // Use authenticated tutor's ID
            'level' => 'Beginner', // Default
            'status' => 'draft',
            'is_approved' => true,
            'type_of_school' => $request->type_of_school,
            'year' => $request->year,
            'subject' => $request->subject,
            'price' => 0, // Tutors create learning-only courses
            'registration_fee' => 0,
        ]);

        return response()->json($course, 201);
    }

    // Get single course details
    // Get single course details
    public function showCourse(Request $request, $id)
    {
        $course = Course::withTrashed()->with(['tutor'])->withCount(['enrollments', 'lessons'])->findOrFail($id);
        
        // Add is_enrolled attribute if user is authenticated
        if ($user = $request->user('sanctum')) {
            $course->is_enrolled = $course->enrollments()->where('student_id', $user->id)->exists();
        } else {
            $course->is_enrolled = false;
        }

        return response()->json($course);
    }

    // Enroll in a course
    public function enroll(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $user = $request->user();

        // Check if already enrolled
        if ($course->enrollments()->where('student_id', $user->id)->exists()) {
            return response()->json(['message' => 'Already enrolled'], 409);
        }

        // Create enrollment
        $enrollment = \App\Models\Enrollment::create([
            'course_id' => $course->id,
            'student_id' => $user->id,
            'enrollment_date' => now(),
            'status' => 'active',
            'progress' => 0
        ]);

        return response()->json([
            'message' => 'Enrolled successfully',
            'enrollment' => $enrollment
        ], 201);
    }

    // Create a new chapter
    public function storeChapter(Request $request, $courseId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $maxOrder = Chapter::where('course_id', $courseId)->max('order') ?? -1;

        $chapter = Chapter::create([
            'course_id' => $courseId,
            'title' => $request->title,
            'order' => $maxOrder + 1
        ]);

        return response()->json($chapter, 201);
    }

    // Update a chapter
    public function updateChapter(Request $request, $id)
    {
        $chapter = Chapter::findOrFail($id);
        
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $chapter->update([
            'title' => $request->title
        ]);

        return response()->json($chapter);
    }

    // Delete a chapter
    public function deleteChapter($id)
    {
        $chapter = Chapter::with('lessons')->findOrFail($id);
        
        // Loop through lessons to delete files
        foreach ($chapter->lessons as $lesson) {
            if ($lesson->file_path) {
                Storage::disk('public')->delete($lesson->file_path);
            }
        }
        
        $chapter->delete(); // This should cascade delete lessons if foreign keys are set, but Laravel model events/cascade is safer

        return response()->json(['message' => 'Chapter deleted successfully']);
    }

    // Create a new lesson
    public function storeLesson(Request $request, $chapterId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf,text,live_class',  // Added live_class
            'content' => 'nullable|string', // URL or text
            'file' => 'nullable|file|mimes:pdf,mp4,mov,avi|max:20480', // 20MB max for demo
            'is_free' => 'boolean'
        ]);

        $chapter = Chapter::findOrFail($chapterId);
        $maxOrder = Lesson::where('chapter_id', $chapterId)->max('order') ?? -1;

        $param = [
            'chapter_id' => $chapterId,
            'title' => $request->title,
            'type' => $request->type,
            'content' => $request->content,
            'order' => $maxOrder + 1,
            'is_free' => $request->is_free ?? false,
        ];

        if ($request->type === 'live_class') {
            // For scheduled meetings, use tutor's specified time
            if ($request->has('start_time') && $request->has('duration')) {
                $param['start_time'] = $request->start_time;
                $param['duration'] = $request->duration;
            } else {
                // For instant meetings, use current time
                $param['start_time'] = now();
                $param['duration'] = 60; // default 60 minutes
            }
            
            // Manual Meeting Link
            $param['meeting_link'] = $request->meeting_link;
            $param['status'] = 'scheduled';
        } else {
            // For video, pdf, text lessons: auto-assign current time as "publish time"
            // This allows them to appear in class history
            $param['start_time'] = now();
            $param['duration'] = null; // Non-live lessons don't have duration
        }

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('course_materials', 'public');
            $param['file_path'] = $path;
        }

        $lesson = Lesson::create($param);

        return response()->json($lesson, 201);
    }

    // Get a single lesson (for preview/viewing)
    public function showLesson($id)
    {
        $lesson = Lesson::findOrFail($id);
        return response()->json($lesson);
    }

    // Update a lesson
    public function updateLesson(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf,text,live_class',
            'content' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,mp4,mov,avi|max:20480',
            'is_free' => 'boolean'
        ]);

        $updates = [
            'title' => $request->title,
            'type' => $request->type,
            'content' => $request->content,
            'is_free' => $request->is_free ?? false,
        ];

        if ($request->type === 'live_class') {
             if ($request->has('meeting_link')) $updates['meeting_link'] = $request->meeting_link;
             if ($request->has('start_time')) $updates['start_time'] = $request->start_time;
             if ($request->has('duration')) $updates['duration'] = $request->duration;
        }

        if ($request->hasFile('file')) {
            // Delete old file
            if ($lesson->file_path) {
                Storage::disk('public')->delete($lesson->file_path);
            }
            $path = $request->file('file')->store('course_materials', 'public');
            $updates['file_path'] = $path;
        }

        $lesson->update($updates);

        return response()->json($lesson);
    }
    
    // Live Class Management

    public function getLiveClasses($courseId)
    {
        return response()->json(\App\Models\LiveClass::where('course_id', $courseId)->orderBy('start_time', 'desc')->get());
    }

    public function scheduleLiveClass(Request $request, $courseId)
    {
        $request->validate([
            'topic' => 'required|string',
            'start_time' => 'required|date',
            'duration' => 'required|integer', // minutes
        ]);

        // Mock Google Meet Link Generation
        $meetLink = 'https://meet.google.com/' . strtolower(\Illuminate\Support\Str::random(10));

        $liveClass = \App\Models\LiveClass::create([
            'course_id' => $courseId,
            'topic' => $request->topic,
            'start_time' => $request->start_time,
            'duration' => $request->duration,
            'meeting_link' => $meetLink,
            'status' => 'scheduled'
        ]);
        
        return response()->json($liveClass, 201);
    }

    public function updateLiveClass(Request $request, $id)
    {
        $liveClass = \App\Models\LiveClass::findOrFail($id);
        
        $request->validate([
            'recording_url' => 'nullable|url',
            'title' => 'sometimes|string',
            'file' => 'nullable|file|mimes:pdf|max:10240'
        ]);

        $updates = [];
        if ($request->has('recording_url')) $updates['recording_url'] = $request->recording_url;
        if ($request->has('title')) $updates['topic'] = $request->title;
        
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('class_materials', 'public');
            $updates['materials_path'] = $path;
        }

        // If recording or materials added, mark as completed
        if (!empty($updates['recording_url']) || !empty($updates['materials_path'])) {
            $updates['status'] = 'completed';
        }

        $liveClass->update($updates);

        return response()->json($liveClass);
    }

    // Delete a lesson
    public function deleteLesson($id)
    {
        $lesson = Lesson::findOrFail($id);
        
        // Optional: Delete file if exists
        if ($lesson->file_path) {
            Storage::disk('public')->delete($lesson->file_path);
        }
        
        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted successfully']);
    }

    // Get enrolled students for a course
    public function getEnrolledStudents($courseId)
    {
        $course = Course::findOrFail($courseId);
        
        // Assuming 'enrollments' relationship exists on Course model
        // and 'student' relationship exists on Enrollment model
        $students = $course->enrollments()->with('student')->get()->map(function($enrollment) {
            return $enrollment->student;
        });

        return response()->json($students);
    }

    // Get courses the student is enrolled in
    public function getStudentEnrollments(Request $request)
    {
        $user = $request->user();
        
        // Get courses via enrollments (include soft-deleted courses so enrolled students still see them)
        $courses = Course::withTrashed()
            ->whereHas('enrollments', function($query) use ($user) {
                $query->where('student_id', $user->id);
            })
            ->with('tutor') // Include tutor details
            ->withCount('lessons') // Include lesson count for progress calculation (mock)
            ->get()
            ->map(function ($course) use ($user) {
                // Get enrollment details
                $enrollment = $course->enrollments()->where('student_id', $user->id)->first();
                $course->enrollment_status = $enrollment->status;
                $course->progress = $enrollment->progress;
                $course->enrollment_date = $enrollment->enrollment_date;
                return $course;
            });

        return response()->json($courses);
    }

    public function getPublicCourses(Request $request)
    {
        $query = Course::where('status', 'published')
            ->where('is_platform_visible', true)
            ->with('tutor');

        if ($request->has('school_type')) {
            $types = explode(',', $request->school_type);
            $query->whereIn('type_of_school', $types);
        }

        if ($request->has('year')) {
            $years = explode(',', $request->year);
            $query->whereIn('year', $years);
        }

        if ($request->has('subject')) {
            $subjects = explode(',', $request->subject);
            $query->whereIn('subject', $subjects);
        }

        return response()->json($query->paginate(12));
    }

    /**
     * Create real Google Meet link for a lesson
     */
    public function createGoogleMeet(Request $request, $lessonId)
    {
        $request->validate([
            'meeting_type' => 'required|in:instant,scheduled',
            'start_time' => 'required_if:meeting_type,scheduled|date',
            'duration' => 'required_if:meeting_type,scheduled|integer|min:15',
            'timezone' => 'nullable|string',
        ]);

        $lesson = Lesson::findOrFail($lessonId);
        $user = $request->user();

        try {
            $googleMeetService = app(\App\Services\GoogleMeetService::class);

            // Check if Google account is connected
            if (!$googleMeetService->isConnected($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please connect your Google account first',
                    'needs_auth' => true,
                ], 400);
            }

            $meetingData = null;

            if ($request->meeting_type === 'instant') {
                $meetingData = $googleMeetService->createInstantMeeting(
                    $user,
                    $lesson->title,
                    "Live class for: {$lesson->title}"
                );
            } else {
                $userTimezone = $request->timezone ?? 'UTC';
                $startTime = \Carbon\Carbon::parse($request->start_time, $userTimezone);
                
                // Get enrolled students' emails for calendar invites
                $attendeeEmails = $lesson->chapter->course->enrollments()
                    ->with('student')
                    ->get()
                    ->pluck('student.email')
                    ->filter()
                    ->toArray();
                
                $meetingData = $googleMeetService->createScheduledMeeting(
                    $user,
                    $lesson->title,
                    $startTime,
                    $request->duration,
                    "Live class for: {$lesson->title}",
                    $attendeeEmails,
                    $userTimezone
                );
            }

            // Update lesson with Google Meet details
            $lesson->update([
                'meeting_link' => $meetingData['meeting_link'],
                'google_event_id' => $meetingData['event_id'],
                'meeting_type' => $request->meeting_type,
                'start_time' => $meetingData['start_time'],
                'duration' => $request->meeting_type === 'scheduled' ? $request->duration : 60,
            ]);

            // TODO: Send notifications to enrolled students
            // $notificationService = app(\App\Services\NotificationService::class);
            // $notificationService->notifyStudents($lesson->id);

            return response()->json([
                'success' => true,
                'lesson' => $lesson,
                'meeting_link' => $meetingData['meeting_link'],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating Google Meet: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Google Meet: ' . $e->getMessage(),
            ], 500);
        }
    }
}

