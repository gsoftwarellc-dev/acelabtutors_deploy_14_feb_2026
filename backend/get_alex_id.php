<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'alex@example.com')->first();
if ($user) {
    echo "ID: " . $user->id;
} else {
    echo "User not found";
}
