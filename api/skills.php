<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    if (defined('DB_ERROR') && DB_ERROR) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }

    $sql = "SELECT * FROM skills";
    $result = $conn->query($sql);
    $skills = [];
    if($result) {
        while($row = $result->fetch_assoc()) $skills[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $skills]);
    exit;
}

// POST (Add)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $category = $input['category'] ?? 'Development';
    $icon = $input['icon'] ?? 'Code';

    $stmt = $conn->prepare("INSERT INTO skills (name, category, icon) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $category, $icon);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}

// DELETE
if ($method === 'DELETE') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $id = $_GET['id'] ?? 0;
    $stmt = $conn->prepare("DELETE FROM skills WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}
?>
