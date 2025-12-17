<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

function getProfileData() {
    if (!file_exists(PROFILE_FILE)) return [];
    $content = file_get_contents(PROFILE_FILE);
    return json_decode($content, true) ?? [];
}

function saveProfileData($data) {
    // Ensure directory exists
    $dir = dirname(PROFILE_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    
    // Ensure parent directory is writable
    if (!is_writable($dir)) {
        chmod($dir, 0777);
    }
    
    $result = file_put_contents(PROFILE_FILE, json_encode($data, JSON_PRETTY_PRINT));
    
    // Set file permissions if successfully created
    if ($result !== false && file_exists(PROFILE_FILE)) {
        chmod(PROFILE_FILE, 0666);
    }
    
    return $result;
}

// GET
if ($method === 'GET') {
    $data = getProfileData();
    if (!empty($data)) {
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        echo json_encode(['success' => false, 'data' => []]);
    }
    exit;
}

// POST (Update)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }
    
    $currentData = getProfileData();

    // Handle File Upload if present
    $avatarPath = $currentData['avatar'] ?? ''; // Keep old if not changed
    
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        $ext = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));
        
        if (in_array($ext, $allowed)) {
            $uploadDir = '../assets/images/profile/'; // Ensure double dot if relative to api/
            // Check dir logic
            if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $newFilename = 'avatar_' . time() . '.' . $ext;
            $destPath = $uploadDir . $newFilename;
            
            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
                $avatarPath = 'assets/images/profile/' . $newFilename; // Path for DB/JSON
            }
        }
    }

    $name = $_POST['name'] ?? $currentData['name'] ?? '';
    $role = $_POST['role'] ?? $currentData['role'] ?? '';
    $tagline = $_POST['tagline'] ?? $currentData['tagline'] ?? '';
    $about_text = $_POST['about_text'] ?? $currentData['about_text'] ?? '';
    $years_exp = $_POST['years_exp'] ?? $currentData['years_exp'] ?? '';
    $projects_count = $_POST['projects_count'] ?? $currentData['projects_count'] ?? '';
    $email = $_POST['email'] ?? $currentData['email'] ?? '';
    $linkedin = $_POST['linkedin'] ?? $currentData['socials']['linkedin'] ?? '';
    $github = $_POST['github'] ?? $currentData['socials']['github'] ?? '';
    $dribbble = $_POST['dribbble'] ?? $currentData['socials']['dribbble'] ?? '';

    $newData = [
        'name' => $name,
        'role' => $role,
        'tagline' => $tagline,
        'about_text' => $about_text,
        'years_exp' => $years_exp,
        'projects_count' => $projects_count,
        'email' => $email,
        'avatar' => $avatarPath,
        'socials' => [
            'linkedin' => $linkedin,
            'github' => $github,
            'dribbble' => $dribbble
        ]
    ];

    if (saveProfileData($newData)) {
        echo json_encode(['success' => true]);
    } else {
        $e = error_get_last();
        echo json_encode(['success' => false, 'message' => 'Failed to save: ' . ($e['message'] ?? 'Unknown')]);
    }
    exit;
}
?>
