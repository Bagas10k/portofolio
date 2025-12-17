<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET 
if ($method === 'GET') {
    $sql = "SELECT * FROM projects ORDER BY id DESC";
    $result = $conn->query($sql);
    
    $projects = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Convert comma-separated tags to array
            $row['tags'] = $row['tags'] ? explode(',', $row['tags']) : [];
            $projects[] = $row;
        }
    }
    
    echo json_encode($projects);
    exit;
}
?>
