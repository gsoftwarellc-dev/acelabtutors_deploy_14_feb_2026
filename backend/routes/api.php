<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);
Route::post('/webhook/stripe', [\App\Http\Controllers\StudentFinanceController::class, 'webhook']);

// Google OAuth Callback (no auth required)
Route::get('/google/callback', [\App\Http\Controllers\GoogleAuthController::class, 'callback']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\AuthController::class, 'me']);
    
    // Existing protected routes could be moved here eventually
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/user/avatar', [\App\Http\Controllers\AuthController::class, 'updateAvatar']);
    Route::post('/user/password', [\App\Http\Controllers\AuthController::class, 'updatePassword']);

    // Admin User Management Routes
    Route::get('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'index']);
    Route::post('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'store']);
    Route::get('/admin/users/{id}', [\App\Http\Controllers\AdminUserController::class, 'show']);
    Route::get('/admin/users/{id}/performance', [\App\Http\Controllers\AdminUserController::class, 'getPerformance']);
    Route::put('/admin/users/{id}', [\App\Http\Controllers\AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [\App\Http\Controllers\AdminUserController::class, 'destroy']);
    
    // Enhanced Admin Actions
    Route::post('/admin/users/{id}/toggle-suspend', [\App\Http\Controllers\AdminUserController::class, 'toggleSuspend']);
    Route::post('/admin/users/{id}/enroll', [\App\Http\Controllers\AdminUserController::class, 'enroll']);
    Route::delete('/admin/users/{id}/courses/{courseId}', [\App\Http\Controllers\AdminUserController::class, 'unenroll']);
    Route::get('/admin/courses', [\App\Http\Controllers\AdminUserController::class, 'getCourses']);
    Route::delete('/admin/courses/{id}', [\App\Http\Controllers\AdminUserController::class, 'deleteCourse']);

    // Admin Finance Routes
    Route::get('/admin/finance/stats', [\App\Http\Controllers\AdminFinanceController::class, 'getStats']);
    Route::get('/admin/finance/transactions', [\App\Http\Controllers\AdminFinanceController::class, 'getTransactions']);
    Route::get('/admin/finance/connect/url', [\App\Http\Controllers\AdminFinanceController::class, 'getConnectUrl']);
    Route::post('/admin/finance/connect/callback', [\App\Http\Controllers\AdminFinanceController::class, 'exchangeCode']);
    Route::post('/admin/finance/connect/config', [\App\Http\Controllers\AdminFinanceController::class, 'storeStripeConfig']);
    Route::post('/admin/finance/payment-link', [\App\Http\Controllers\AdminFinanceController::class, 'createPaymentLink']);
    Route::get('/admin/finance/tutors', [\App\Http\Controllers\AdminFinanceController::class, 'getTutors']);
    Route::post('/admin/finance/payout', [\App\Http\Controllers\AdminFinanceController::class, 'storePayout']);

    // Dashboard Stats
    Route::get('/admin/dashboard/stats', [\App\Http\Controllers\AdminDashboardController::class, 'getStats']);

    // Route::post('/admin/finance/connect', ...) // Replaced by callback or kept for manual fallback? 
    // The frontend uses /connect for manual. We are changing frontend to use OAuth.


    // Messaging Routes
    Route::get('/messages/unread-count', [\App\Http\Controllers\MessageController::class, 'getUnreadCount']);
    Route::get('/messages/contacts', [\App\Http\Controllers\MessageController::class, 'getContacts']);
    Route::get('/messages/{userId}', [\App\Http\Controllers\MessageController::class, 'getMessages']);
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'sendMessage']);
    Route::post('/courses/{id}/enroll', [\App\Http\Controllers\CourseContentController::class, 'enroll']);
    // Student Routes (Authenticated)
    Route::get('/student/dashboard', [\App\Http\Controllers\StudentDashboardController::class, 'getDashboardData']);
    Route::get('/student/courses', [\App\Http\Controllers\CourseContentController::class, 'getStudentEnrollments']);
    Route::get('/courses/{id}/content', [\App\Http\Controllers\CourseContentController::class, 'index']); // Get full curriculum
    // Route::post('/student/checkout', [\App\Http\Controllers\StudentFinanceController::class, 'checkout']); // Moved to public routes

    // Course Content Routes (Now protected with authentication)
    Route::get('/courses', [\App\Http\Controllers\CourseContentController::class, 'getCourses']);
    Route::get('/courses/{id}', [\App\Http\Controllers\CourseContentController::class, 'showCourse']);
    Route::delete('/courses/{id}/force', [\App\Http\Controllers\CourseContentController::class, 'forceDeleteCourse']);
    Route::post('/courses/{id}/restore', [\App\Http\Controllers\CourseContentController::class, 'restoreCourse']);
    Route::post('/courses', [\App\Http\Controllers\CourseContentController::class, 'storeCourse']);
    Route::put('/courses/{id}', [\App\Http\Controllers\CourseContentController::class, 'updateCourse']);
    Route::delete('/courses/{id}', [\App\Http\Controllers\CourseContentController::class, 'deleteCourse']);
    Route::get('/courses/{id}/students', [\App\Http\Controllers\CourseContentController::class, 'getEnrolledStudents']);
    Route::get('/courses/{id}/curriculum', [\App\Http\Controllers\CourseContentController::class, 'index']);
    Route::post('/courses/{id}/chapters', [\App\Http\Controllers\CourseContentController::class, 'storeChapter']);
    Route::put('/chapters/{id}', [\App\Http\Controllers\CourseContentController::class, 'updateChapter']);
    Route::delete('/chapters/{id}', [\App\Http\Controllers\CourseContentController::class, 'deleteChapter']);
    Route::post('/chapters/{id}/lessons', [\App\Http\Controllers\CourseContentController::class, 'storeLesson']);
    Route::get('/lessons/{id}', [\App\Http\Controllers\CourseContentController::class, 'showLesson']);
    Route::put('/lessons/{id}', [\App\Http\Controllers\CourseContentController::class, 'updateLesson']);
    Route::delete('/lessons/{id}', [\App\Http\Controllers\CourseContentController::class, 'deleteLesson']);
    
    // Live Classes
    Route::get('/courses/{id}/live-classes', [\App\Http\Controllers\CourseContentController::class, 'getLiveClasses']);
    Route::post('/courses/{id}/live-classes', [\App\Http\Controllers\CourseContentController::class, 'scheduleLiveClass']);
    Route::post('/live-classes/{id}', [\App\Http\Controllers\CourseContentController::class, 'updateLiveClass']); // Using POST for file upload support
    
    // Google OAuth & Meet Integration
    Route::get('/google/connect', [\App\Http\Controllers\GoogleAuthController::class, 'connect']);
    Route::get('/google/status', [\App\Http\Controllers\GoogleAuthController::class, 'status']);
    Route::post('/google/disconnect', [\App\Http\Controllers\GoogleAuthController::class, 'disconnect']);
    Route::post('/lessons/{id}/create-google-meet', [\App\Http\Controllers\CourseContentController::class, 'createGoogleMeet']);

    // Tutor Dashboard Routes
    Route::get('/tutor/dashboard-stats', [\App\Http\Controllers\TutorDashboardController::class, 'getDashboardStats']);
    Route::get('/tutor/upcoming-classes', [\App\Http\Controllers\TutorDashboardController::class, 'getUpcomingClasses']);

    // Tutor Earnings
    Route::get('/tutor/earnings', [\App\Http\Controllers\TutorEarningsController::class, 'index']);

    // Admin: Record payment to tutor
    Route::post('/admin/tutor-payments', [\App\Http\Controllers\TutorEarningsController::class, 'store']);

    // Attendance Routes
    Route::get('/courses/{id}/attendance', [\App\Http\Controllers\AttendanceController::class, 'index']);
    Route::post('/courses/{id}/attendance', [\App\Http\Controllers\AttendanceController::class, 'store']);
    // Course Control Routes
    Route::get('/admin/courses/approved', [\App\Http\Controllers\AdminCourseController::class, 'getApprovedCourses']);
    Route::post('/admin/courses', [\App\Http\Controllers\AdminCourseController::class, 'store']);
    Route::put('/admin/courses/{id}/visibility', [\App\Http\Controllers\AdminCourseController::class, 'toggleVisibility']);
    Route::put('/admin/courses/{id}/price', [\App\Http\Controllers\AdminCourseController::class, 'updatePrice']);
    Route::put('/admin/courses/{id}', [\App\Http\Controllers\AdminCourseController::class, 'update']);
    Route::delete('/admin/courses/{id}', [\App\Http\Controllers\AdminCourseController::class, 'destroy']);

    // Admin Registration Form Options
    Route::apiResource('admin/registration-form-options', \App\Http\Controllers\RegistrationFormOptionController::class)
        ->names('admin.registration-form-options');

    // Student Registration Routes
    Route::post('/student-registrations', [\App\Http\Controllers\StudentRegistrationController::class, 'store']);
    Route::get('/admin/registrations', [\App\Http\Controllers\StudentRegistrationController::class, 'index']);
    Route::put('/admin/registrations/{id}', [\App\Http\Controllers\StudentRegistrationController::class, 'update']);
    Route::delete('/admin/registrations/{id}', [\App\Http\Controllers\StudentRegistrationController::class, 'destroy']);
    Route::post('/course-options', [\App\Http\Controllers\AdminCourseController::class, 'addCourseOption']);
    Route::put('/course-options', [\App\Http\Controllers\AdminCourseController::class, 'updateCourseOption']);
    Route::delete('/course-options', [\App\Http\Controllers\AdminCourseController::class, 'deleteCourseOption']);

    // Admin Course Approvals (Protected)
    Route::get('/admin/courses/submitted', [\App\Http\Controllers\AdminCourseController::class, 'getSubmittedCourses']);
    Route::post('/admin/courses/{id}/approve', [\App\Http\Controllers\AdminCourseController::class, 'approveCourse']);
    Route::post('/admin/courses/{id}/reject', [\App\Http\Controllers\AdminCourseController::class, 'rejectCourse']);
});

Route::get('/tutor/students', [\App\Http\Controllers\StudentController::class, 'index']);
Route::get('/tutor/students/{id}', [\App\Http\Controllers\StudentController::class, 'show']);

Route::get('/public/courses', [\App\Http\Controllers\CourseContentController::class, 'getPublicCourses']);
Route::get('/course-options', [\App\Http\Controllers\CourseOptionsController::class, 'index']);
Route::get('/registration-form-options', [\App\Http\Controllers\RegistrationFormOptionController::class, 'index']);
Route::get('/registration-form-settings/{form_type}', [\App\Http\Controllers\RegistrationFormSettingController::class, 'show']);
Route::post('/parent/search-child', [\App\Http\Controllers\ParentDashboardController::class, 'searchChild']);

// Public Checkout Route
Route::post('/student/checkout', [\App\Http\Controllers\StudentFinanceController::class, 'checkout']);
Route::get('/student/order-details', [\App\Http\Controllers\StudentFinanceController::class, 'getOrderDetails']);



