<?php
// Configuration & Database Connection

// --- DATABASE CREDENTIALS ---
define('DB_HOST', 'localhost');
define('DB_USER', 'bags_bagas'); // Change to your DB Username
define('DB_PASS', 'bagas123');     // Change to your DB Password
define('DB_NAME', 'bags_portofolio');

// --- ADMIN PASSWORD ---
define('ADMIN_PASSWORD', 'Bagassaputra83');

define('UPLOAD_DIR', __DIR__ . '/../assets/images/projects/');

// --- HEADERS & SECURITY ---
// Disable error printing to avoid breaking JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// --- DATABASE CONNECTION ---
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    // Don't die completely - allow some APIs to work
    // But store error state for APIs that need DB
    define('DB_ERROR', true);
} else {
    define('DB_ERROR', false);
}
?>
