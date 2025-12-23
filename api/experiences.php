<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch all experiences
if ($method === 'GET') {
    if (defined('DB_ERROR') && DB_ERROR) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }

    $sql = "SELECT * FROM experiences ORDER BY year_start DESC";
    $result = $conn->query($sql);
    $data = [];
    if($result) {
        while($row = $result->fetch_assoc()) $data[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

// POST - Add new experience
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $organization = $input['organization'] ?? '';
    $position = $input['position'] ?? '';
    $year_start = $input['year_start'] ?? '';
    $year_end = $input['year_end'] ?? 'Present';
    $description = $input['description'] ?? '';

    if (!$organization || !$position || !$year_start) {
        echo json_encode(['success'=>false, 'message'=>'Missing required fields']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO experiences (organization, position, year_start, year_end, description) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $organization, $position, $year_start, $year_end, $description);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}

// DELETE - Remove experience
if ($method === 'DELETE') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $id = $_GET['id'] ?? 0;
    $stmt = $conn->prepare("DELETE FROM experiences WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}

// PUT - Update experience
if ($method === 'PUT') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;
    $organization = $input['organization'] ?? '';
    $position = $input['position'] ?? '';
    $year_start = $input['year_start'] ?? '';
    $year_end = $input['year_end'] ?? 'Present';
    $description = $input['description'] ?? '';

    if (!$id || !$organization || !$position || !$year_start) {
        echo json_encode(['success'=>false, 'message'=>'Missing required fields']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE experiences SET organization=?, position=?, year_start=?, year_end=?, description=? WHERE id=?");
    $stmt->bind_param("sssssi", $organization, $position, $year_start, $year_end, $description, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}
?>
