<?php
// Configuration & Database Connection

// --- DATABASE SETTINGS (EDIT THIS) ---
define('DB_HOST', 'localhost');
define('DB_USER', 'bags_bagas'); // Change to your DB Username
define('DB_PASS', 'bagas123');     // Change to your DB Password
define('DB_NAME', 'bags_portofolio');

// --- ADMIN PASSWORD ---
define('ADMIN_PASSWORD', 'Bagassaputra83');

// --- PATHS ---
define('UPLOAD_DIR', '../assets/images/projects/');
define('PROJECTS_FILE', '../data/projects.json');
define('EDUCATION_FILE', '../data/education.json');
define('SKILLS_FILE', '../data/skills.json');
define('MESSAGES_FILE', '../data/messages.json');
define('PROFILE_FILE', '../data/profile.json');

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
    // Log error but continue execution so JSON-based APIs still work
    error_log("Database connection failed: " . $conn->connect_error);
    // die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}
?>
