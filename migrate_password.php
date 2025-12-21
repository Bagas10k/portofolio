<?php
/**
 * Password Migration Script
 * Run this ONCE to migrate admin password from config.php to database
 * Access: http://yourwebsite.com/migrate_password.php
 */

require_once 'api/config.php';

echo "<h1>Admin Password Migration</h1>";
echo "<pre>";

// Check if admin table exists
$checkTable = $conn->query("SHOW TABLES LIKE 'admin'");
if ($checkTable->num_rows == 0) {
    echo "[ERROR] Admin table does not exist. Please run database.sql first.\n";
    exit;
}

// Check if admin already exists
$checkAdmin = $conn->query("SELECT COUNT(*) as count FROM admin");
$row = $checkAdmin->fetch_assoc();

if ($row['count'] > 0) {
    echo "[WARNING] Admin user already exists in database.\n";
    echo "If you want to reset password, use reset_admin_password.php instead.\n";
    exit;
}

// Get current password from config.php
if (!defined('ADMIN_PASSWORD')) {
    echo "[ERROR] ADMIN_PASSWORD not found in config.php\n";
    exit;
}

$currentPassword = ADMIN_PASSWORD;
$username = 'admin';

// Hash the password using bcrypt
$hashedPassword = password_hash($currentPassword, PASSWORD_DEFAULT);

// Insert into database
$stmt = $conn->prepare("INSERT INTO admin (username, password_hash) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $hashedPassword);

if ($stmt->execute()) {
    echo "[SUCCESS] Admin user created successfully!\n";
    echo "Username: admin\n";
    echo "Password: (same as before - {$currentPassword})\n";
    echo "Password Hash: {$hashedPassword}\n\n";
    
    echo "---------------------------------------------------\n";
    echo "NEXT STEPS:\n";
    echo "1. Test login at: admin/index.html\n";
    echo "2. After successful login, change your password via admin panel\n";
    echo "3. Remove ADMIN_PASSWORD line from api/config.php\n";
    echo "4. DELETE this file (migrate_password.php) for security\n";
    echo "---------------------------------------------------\n";
} else {
    echo "[ERROR] Failed to create admin user: " . $stmt->error . "\n";
}

$stmt->close();
$conn->close();

echo "</pre>";
?>
