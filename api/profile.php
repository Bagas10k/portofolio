<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    // We assume ID 1 is the main profile
    $sql = "SELECT * FROM profile WHERE id = 1 LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        // Structure data to match expected frontend format
        $data = [
            'name' => $row['name'],
            'role' => $row['role'],
            'tagline' => $row['tagline'],
            'about_text' => $row['about_text'],
            'avatar' => $row['avatar'], // New field
            'years_exp' => $row['years_exp'],
            'projects_count' => $row['projects_count'],
            'email' => $row['email'],
            'socials' => [
                'linkedin' => $row['linkedin'],
                'github' => $row['github'],
                'dribbble' => $row['dribbble']
            ]
        ];
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        echo json_encode(['success' => false, 'data' => []]);
    }
    exit;
}

// POST (Update)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) exit(json_encode(['success'=>false, 'message'=>'Unauthorized']));

    // Handle File Upload if present
    $avatarPath = null;
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        $ext = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));
        
        if (in_array($ext, $allowed)) {
            $uploadDir = '../assets/images/profile/';
            if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $newFilename = 'avatar_' . time() . '.' . $ext;
            $destPath = $uploadDir . $newFilename;
            
            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
                $avatarPath = 'assets/images/profile/' . $newFilename;
            }
        }
    }

    // Since we are using FormData now, accessing $_POST directly
    $name = $_POST['name'] ?? '';
    $role = $_POST['role'] ?? '';
    $tagline = $_POST['tagline'] ?? '';
    $about_text = $_POST['about_text'] ?? '';
    $years_exp = $_POST['years_exp'] ?? '';
    $projects_count = $_POST['projects_count'] ?? '';
    $email = $_POST['email'] ?? '';
    $linkedin = $_POST['linkedin'] ?? '';
    $github = $_POST['github'] ?? '';
    $dribbble = $_POST['dribbble'] ?? '';

    // Build Query
    if ($avatarPath) {
        $stmt = $conn->prepare("UPDATE profile SET name=?, role=?, tagline=?, about_text=?, avatar=?, years_exp=?, projects_count=?, email=?, linkedin=?, github=?, dribbble=? WHERE id=1");
        $stmt->bind_param("sssssssssss", $name, $role, $tagline, $about_text, $avatarPath, $years_exp, $projects_count, $email, $linkedin, $github, $dribbble);
    } else {
        $stmt = $conn->prepare("UPDATE profile SET name=?, role=?, tagline=?, about_text=?, years_exp=?, projects_count=?, email=?, linkedin=?, github=?, dribbble=? WHERE id=1");
        $stmt->bind_param("ssssssssss", $name, $role, $tagline, $about_text, $years_exp, $projects_count, $email, $linkedin, $github, $dribbble);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}
$conn->close();
?>
