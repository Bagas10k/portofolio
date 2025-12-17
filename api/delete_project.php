<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID required']);
        exit;
    }

    // Get image path first to delete file
    $stmt = $conn->prepare("SELECT image FROM projects WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Delete from DB
        $delParams = $conn->prepare("DELETE FROM projects WHERE id = ?");
        $delParams->bind_param("i", $id);
        
        if ($delParams->execute()) {
            // Delete file
            if ($row['image'] && file_exists('../' . $row['image'])) {
                unlink('../' . $row['image']);
            }
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'DB Error']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Project not found']);
    }
}
$conn->close();
?>
