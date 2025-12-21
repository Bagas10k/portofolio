<?php
session_start();
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['password']) || empty($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Password is required']);
    exit;
}

$password = $data['password'];

// Query admin from database
$stmt = $conn->prepare("SELECT password_hash FROM admin WHERE username = 'admin' LIMIT 1");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Admin user not found. Please run migrate_password.php first.']);
    exit;
}

$admin = $result->fetch_assoc();
$stmt->close();

// Verify password using password_verify
if (password_verify($password, $admin['password_hash'])) {
    $_SESSION['logged_in'] = true;
    $_SESSION['username'] = 'admin';
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid password']);
}
?>
