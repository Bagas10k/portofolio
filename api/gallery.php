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

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['image'];
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Validation
    if (!in_array($ext, $allowed)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, WEBP, and GIF allowed.']);
        exit;
    }
    
    if ($file['size'] > 10 * 1024 * 1024) { // 10MB max
        echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 10MB.']);
        exit;
    }

    // Create upload directory
    $uploadDir = '../assets/images/gallery/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $newFilename = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $destPath = $uploadDir . $newFilename;
    $filepath = 'assets/images/gallery/' . $newFilename;

    if (move_uploaded_file($file['tmp_name'], $destPath)) {
        // Save to database
        $stmt = $conn->prepare("INSERT INTO gallery (filename, filepath, filesize, filetype) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssis", $file['name'], $filepath, $file['size'], $file['type']);
        
        if ($stmt->execute()) {
            $imageId = $stmt->insert_id;
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
            echo json_encode(['success' => false, 'message' => 'Failed to save to database']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
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
