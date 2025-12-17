<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

function getProfile() {
    if (!file_exists(PROFILE_FILE)) return [];
    $json = file_get_contents(PROFILE_FILE);
    return json_decode($json, true) ?? [];
}

function saveProfile($data) {
    file_put_contents(PROFILE_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

// GET: Fetch profile
if ($method === 'GET') {
    echo json_encode(['success' => true, 'data' => getProfile()]);
    exit;
}

// POST: Update profile (Admin only)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    // Merge with existing to keep other fields if partial update (optional, but safer to replace generally for this simple app)
    // But let's just replace relevant fields to ensure consistency
    
    $newProfile = [
        "name" => $input['name'] ?? '',
        "role" => $input['role'] ?? '',
        "tagline" => $input['tagline'] ?? '',
        "about_text" => $input['about_text'] ?? '',
        "years_exp" => $input['years_exp'] ?? '',
        "projects_count" => $input['projects_count'] ?? '',
        "email" => $input['email'] ?? '',
        "socials" => [
            "linkedin" => $input['linkedin'] ?? '',
            "github" => $input['github'] ?? '',
            "dribbble" => $input['dribbble'] ?? ''
        ]
    ];

    saveProfile($newProfile);
    echo json_encode(['success' => true, 'data' => $newProfile]);
    exit;
}
?>
