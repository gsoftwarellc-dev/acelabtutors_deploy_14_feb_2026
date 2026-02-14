<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$students = \App\Models\User::where('role', 'student')->get(['id', 'name', 'email']);

echo "Found " . $students->count() . " students:\n";
foreach ($students as $student) {
    echo "ID: " . $student->id . " - " . $student->name . " (" . $student->email . ")\n";
}
