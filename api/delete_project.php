<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;

    if (!$id) {
         echo json_encode(['success' => false, 'message' => 'No ID provided']);
         exit;
    }
    
    // Get image path before deleting
    $stmt = $conn->prepare("SELECT image FROM projects WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $imagePath = '../' . $row['image'];
        
        // Delete from database
        $deleteStmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
        $deleteStmt->bind_param("i", $id);
        
        if ($deleteStmt->execute()) {
            // Delete image file
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $deleteStmt->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Project not found']);
    }
}
?>
