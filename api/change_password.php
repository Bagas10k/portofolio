<?php
session_start();
require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login first.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['current_password']) || !isset($data['new_password'])) {
    echo json_encode(['success' => false, 'message' => 'Current password and new password are required']);
    exit;
}

$currentPassword = $data['current_password'];
$newPassword = $data['new_password'];

// Validate new password strength
if (strlen($newPassword) < 8) {
    echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters long']);
    exit;
}

// Get current password hash from database
$stmt = $conn->prepare("SELECT password_hash FROM admin WHERE username = 'admin' LIMIT 1");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Admin user not found']);
    exit;
}

$admin = $result->fetch_assoc();
$stmt->close();

// Verify current password
if (!password_verify($currentPassword, $admin['password_hash'])) {
    echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
    exit;
}

// Hash new password
$newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password in database
$stmt = $conn->prepare("UPDATE admin SET password_hash = ?, updated_at = NOW() WHERE username = 'admin'");
$stmt->bind_param("s", $newPasswordHash);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true, 
        'message' => 'Password changed successfully! Please use your new password for future logins.'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update password. Please try again.']);
}

$stmt->close();
$conn->close();
?>
