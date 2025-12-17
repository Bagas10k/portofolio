<?php
// Configuration & Database Connection

// --- DATABASE SETTINGS (EDIT THIS) ---
define('DB_HOST', 'localhost');
define('DB_USER', 'bags_bagas'); // Change to your DB Username
define('DB_PASS', 'bagas123');     // Change to your DB Password
define('DB_NAME', 'bags_portofolio');

// --- ADMIN PASSWORD ---
define('ADMIN_PASSWORD', 'admin123');

// --- PATHS ---
define('UPLOAD_DIR', '../assets/images/projects/');

// --- HEADERS & SECURITY ---
// Disable error printing to avoid breaking JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// --- DB CONNECTION ---
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    // If connection fails, output JSON error and stop
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}
?>
