<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\CourseOption;
use App\Models\Course;

echo "Tables in database:\n";
$tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
foreach ($tables as $table) {
    echo "- " . $table->name . "\n";
}

echo "\nChecking CourseOption count:\n";
try {
    echo CourseOption::count() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nChecking Course count:\n";
try {
    echo Course::count() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
