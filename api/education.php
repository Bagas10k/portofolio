<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    $sql = "SELECT * FROM education ORDER BY year DESC";
    $result = $conn->query($sql);
    $data = [];
    if($result) {
        while($row = $result->fetch_assoc()) $data[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

// POST (Add)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $school = $input['school'] ?? '';
    $degree = $input['degree'] ?? '';
    $year = $input['year'] ?? '';
    $desc = $input['description'] ?? '';

    if (!$school || !$degree || !$year) {
        echo json_encode(['success'=>false, 'message'=>'Missing fields']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO education (school, degree, year, description) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $school, $degree, $year, $desc);
    
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
    $stmt = $conn->prepare("DELETE FROM education WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}
$conn->close();
?>
