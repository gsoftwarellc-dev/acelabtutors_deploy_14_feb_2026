<?php

require __DIR__ . '/vendor/autoload.php';

// Connect to SQLite database
$db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Check if admin user already exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute(['admin@acelab.com']);
$existing = $stmt->fetch();

if ($existing) {
    echo "Admin user already exists (ID: {$existing['id']})\n";
    exit(0);
}

// Create admin user with properly hashed password
$password = password_hash('password', PASSWORD_BCRYPT);

$stmt = $db->prepare("
    INSERT INTO users (name, email, password, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
");

$now = date('Y-m-d H:i:s');
$stmt->execute([
    'Admin User',
    'admin@acelab.com',
    $password,
    'active',
    $now,
    $now
]);

$adminId = $db->lastInsertId();

echo "✅ Admin user created successfully!\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "ID: $adminId\n";
echo "Email: admin@acelab.com\n";
echo "Password: password\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\nYou can now log in with these credentials.\n";
