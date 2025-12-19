<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    if (defined('DB_ERROR') && DB_ERROR) {
        echo json_encode(['success'=>false, 'message'=>'Database Connection Failed']);
        exit;
    }

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
            'avatar' => $row['avatar'],
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
        // Table might not exist or empty
        echo json_encode(['success' => false, 'message' => 'Profile not found. Please run setup.']);
    }
    exit;
}

// POST (Update)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    // Check if avatar is selected from gallery
    if (isset($_POST['avatar_from_gallery']) && !empty($_POST['avatar_from_gallery'])) {
        $avatarPath = $_POST['avatar_from_gallery'];
        error_log("Setting avatar from gallery: " . $avatarPath);
        
        // Validate that file exists
        if (file_exists('../' . $avatarPath)) {
            // Update only avatar field
            $stmt = $conn->prepare("UPDATE profile SET avatar=? WHERE id=1");
            $stmt->bind_param("s", $avatarPath);
            
            if ($stmt->execute()) {
                error_log("Avatar updated successfully from gallery");
                echo json_encode(['success' => true, 'avatar' => $avatarPath]);
            } else {
                error_log("Failed to update avatar: " . $stmt->error);
                echo json_encode(['success' => false, 'message' => $stmt->error]);
            }
            $conn->close();
            exit;
        } else {
            error_log("Gallery image not found: " . $avatarPath);
            echo json_encode(['success' => false, 'message' => 'Image file not found']);
            $conn->close();
            exit;
        }
    }

    // Handle File Upload if present (existing logic)
    $avatarPath = null;
    $uploadError = '';

    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] !== UPLOAD_ERR_NO_FILE) {
        error_log("Avatar upload attempt detected");
        
        if ($_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            $ext = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));
            
            error_log("File extension: " . $ext);
            error_log("File size: " . $_FILES['avatar']['size']);
            
            if (!in_array($ext, $allowed)) {
                $uploadError = 'Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.';
                error_log("Upload error: Invalid file type - " . $ext);
            } elseif ($_FILES['avatar']['size'] > 5 * 1024 * 1024) { // 5MB max
                $uploadError = 'File too large. Maximum size is 5MB.';
                error_log("Upload error: File too large - " . $_FILES['avatar']['size']);
            } else {
                try {
                    $uploadDir = '../assets/images/profile/';
                    if (!file_exists($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                        error_log("Created upload directory: " . $uploadDir);
                    }
                    
                    // Get current avatar from database to delete old file
                    $getCurrentAvatar = $conn->query("SELECT avatar FROM profile WHERE id=1 LIMIT 1");
                    if ($getCurrentAvatar && $getCurrentAvatar->num_rows > 0) {
                        $currentRow = $getCurrentAvatar->fetch_assoc();
                        $oldAvatarPath = $currentRow['avatar'];
                        
                        // Delete old avatar file if it exists and different extension
                        if ($oldAvatarPath && file_exists('../' . $oldAvatarPath)) {
                            $oldExt = pathinfo($oldAvatarPath, PATHINFO_EXTENSION);
                            // Delete if different extension or force replace
                            if (strtolower($oldExt) !== $ext || true) {
                                if (unlink('../' . $oldAvatarPath)) {
                                    error_log("Deleted old avatar: " . $oldAvatarPath);
                                } else {
                                    error_log("Failed to delete old avatar: " . $oldAvatarPath);
                                }
                            }
                        }
                    }
                    
                    // Use fixed filename: avatar.{ext}
                    $newFilename = 'avatar.' . $ext;
                    $destPath = $uploadDir . $newFilename;
                    
                    error_log("Attempting to move file to: " . $destPath);
                    
                    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destPath)) {
                        $avatarPath = 'assets/images/profile/' . $newFilename;
                        error_log("Successfully uploaded avatar to: " . $avatarPath);
                    } else {
                        $uploadError = 'Failed to move uploaded file. Check directory permissions.';
                        error_log("Failed to move uploaded file from " . $_FILES['avatar']['tmp_name'] . " to " . $destPath);
                    }
                } catch (Exception $e) {
                    $uploadError = 'Upload exception: ' . $e->getMessage();
                    error_log("Upload exception: " . $e->getMessage());
                }
            }
        } else {
            $uploadError = 'Upload error code: ' . $_FILES['avatar']['error'];
            error_log("Upload error code: " . $_FILES['avatar']['error']);
        }
    }

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
        error_log("Updating profile WITH new avatar: " . $avatarPath);
        $stmt = $conn->prepare("UPDATE profile SET name=?, role=?, tagline=?, about_text=?, avatar=?, years_exp=?, projects_count=?, email=?, linkedin=?, github=?, dribbble=? WHERE id=1");
        $stmt->bind_param("sssssssssss", $name, $role, $tagline, $about_text, $avatarPath, $years_exp, $projects_count, $email, $linkedin, $github, $dribbble);
    } else {
        error_log("Updating profile WITHOUT new avatar");
        $stmt = $conn->prepare("UPDATE profile SET name=?, role=?, tagline=?, about_text=?, years_exp=?, projects_count=?, email=?, linkedin=?, github=?, dribbble=? WHERE id=1");
        $stmt->bind_param("ssssssssss", $name, $role, $tagline, $about_text, $years_exp, $projects_count, $email, $linkedin, $github, $dribbble);
    }

    if ($stmt->execute()) {
        error_log("Profile update successful. Rows affected: " . $stmt->affected_rows);
        $response = ['success' => true];
        if ($avatarPath) {
            $response['avatar'] = $avatarPath;
            error_log("Returning avatar path: " . $avatarPath);
        }
        if ($uploadError) {
            $response['warning'] = $uploadError;
            error_log("Upload had warning: " . $uploadError);
        }
        echo json_encode($response);
    } else {
        error_log("Profile update FAILED: " . $stmt->error);
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    $conn->close();
    exit;
}
?>
