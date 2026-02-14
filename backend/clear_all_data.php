<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\CourseOption;
use Illuminate\Support\Facades\DB;

echo "Current database connection: " . DB::connection()->getDatabaseName() . "\n";
echo "Driver: " . DB::connection()->getDriverName() . "\n\n";

// Clear all data
DB::table('courses')->truncate();
DB::table('enrollments')->truncate();
DB::table('course_options')->truncate();

echo "✓ Courses cleared\n";
echo "✓ Enrollments cleared\n";
echo "✓ Course options (filters) cleared\n\n";

echo "Final counts:\n";
echo "- Courses: " . Course::count() . "\n";
echo "- Enrollments: " . Enrollment::count() . "\n";
echo "- Course Options: " . CourseOption::count() . "\n";
