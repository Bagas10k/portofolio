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

    $sql = "SELECT * FROM projects ORDER BY id DESC";
    $result = $conn->query($sql);
    
    $projects = [];
    if ($result) {
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Convert comma-separated tags to array
                $row['tags'] = $row['tags'] ? explode(',', $row['tags']) : [];
                $projects[] = $row;
            }
        }
    } else {
         // Query failed - missing table?
         // Return empty but log it or maybe hint at setup
         // For now return empty list usually, but let's be explicit if debugging
    }
    
    echo json_encode($projects);
    $conn->close();
    exit;
}
?>
