<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\CourseOption;

echo "Course count: " . Course::count() . "\n";
echo "Enrollment count: " . Enrollment::count() . "\n";
echo "CourseOption count: " . CourseOption::count() . "\n";

if (Course::count() > 0) {
    echo "\nFirst 5 courses:\n";
    foreach (Course::take(5)->get() as $course) {
        echo "- {$course->id}: {$course->name}\n";
    }
}
