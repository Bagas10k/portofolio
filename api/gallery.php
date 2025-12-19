<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - List all images
if ($method === 'GET') {
    if (defined('DB_ERROR') && DB_ERROR) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }

    $sql = "SELECT * FROM gallery ORDER BY created_at DESC";
    $result = $conn->query($sql);
    
    $images = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $images[] = $row;
        }
    }
    
    echo json_encode(['success' => true, 'data' => $images]);
    $conn->close();
    exit;
}

// POST - Upload new image
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    error_log("Gallery upload attempt started");

    if (!isset($_FILES['image'])) {
        error_log("No image file in request");
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit;
    }

    if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $error_code = $_FILES['image']['error'];
        error_log("Upload error code: " . $error_code);
        echo json_encode(['success' => false, 'message' => 'Upload error code: ' . $error_code]);
        exit;
    }

    $file = $_FILES['image'];
    error_log("File upload - Name: " . $file['name'] . ", Size: " . $file['size'] . ", Type: " . $file['type']);
    
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Validation
    if (!in_array($ext, $allowed)) {
        error_log("Invalid file type: " . $ext);
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, WEBP, and GIF allowed.']);
        exit;
    }
    
    if ($file['size'] > 10 * 1024 * 1024) { // 10MB max
        error_log("File too large: " . $file['size']);
        echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 10MB.']);
        exit;
    }

    // Create upload directory
    $uploadDir = '../assets/images/gallery/';
    error_log("Upload directory: " . $uploadDir);
    
    if (!file_exists($uploadDir)) {
        error_log("Directory does not exist, creating...");
        if (!mkdir($uploadDir, 0777, true)) {
            error_log("Failed to create directory");
            echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
            exit;
        }
        error_log("Directory created successfully");
    }

    if (!is_writable($uploadDir)) {
        error_log("Directory is not writable");
        echo json_encode(['success' => false, 'message' => 'Upload directory is not writable. Check permissions.']);
        exit;
    }

    // Generate unique filename
    $newFilename = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $destPath = $uploadDir . $newFilename;
    $filepath = 'assets/images/gallery/' . $newFilename;

    error_log("Attempting to move file from " . $file['tmp_name'] . " to " . $destPath);

    if (move_uploaded_file($file['tmp_name'], $destPath)) {
        error_log("File moved successfully");
        
        // Save to database
        $stmt = $conn->prepare("INSERT INTO gallery (filename, filepath, filesize, filetype) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssis", $file['name'], $filepath, $file['size'], $file['type']);
        
        if ($stmt->execute()) {
            $imageId = $stmt->insert_id;
            error_log("Saved to database with ID: " . $imageId);
            echo json_encode([
                'success' => true, 
                'message' => 'Image uploaded successfully',
                'data' => [
                    'id' => $imageId,
                    'filename' => $file['name'],
                    'filepath' => $filepath,
                    'filesize' => $file['size'],
                    'filetype' => $file['type']
                ]
            ]);
        } else {
            // Delete uploaded file if database insert fails
            unlink($destPath);
            error_log("Database insert failed: " . $stmt->error);
            echo json_encode(['success' => false, 'message' => 'Failed to save to database: ' . $stmt->error]);
        }
    } else {
        error_log("Failed to move uploaded file. Check permissions on: " . $uploadDir);
        echo json_encode(['success' => false, 'message' => 'Failed to upload file. Check directory permissions.']);
    }
    
    $conn->close();
    exit;
}

// DELETE - Delete image
if ($method === 'DELETE') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $id = $_GET['id'] ?? 0;
    
    // Get image info first
    $stmt = $conn->prepare("SELECT filepath FROM gallery WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $filepath = '../' . $row['filepath'];
        
        // Delete from database
        $deleteStmt = $conn->prepare("DELETE FROM gallery WHERE id = ?");
        $deleteStmt->bind_param("i", $id);
        
        if ($deleteStmt->execute()) {
            // Delete file from server
            if (file_exists($filepath)) {
                unlink($filepath);
            }
            echo json_encode(['success' => true, 'message' => 'Image deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete from database']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Image not found']);
    }
    
    $conn->close();
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request method']);
?>
