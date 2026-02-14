<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$migration = '2026_01_30_224139_create_courses_table';

$deleted = DB::table('migrations')->where('migration', $migration)->delete();

echo "Deleted $deleted rows for migration: $migration\n";

// Also check for enrollments table migration
$migrationEnrollments = '2026_01_30_224139_create_enrollments_table';
$deletedEnrollments = DB::table('migrations')->where('migration', $migrationEnrollments)->delete();
echo "Deleted $deletedEnrollments rows for migration: $migrationEnrollments\n";
