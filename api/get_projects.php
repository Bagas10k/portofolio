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
                // Map DB columns to Frontend expectations
                $row['tags'] = !empty($row['tech_stack']) ? explode(',', $row['tech_stack']) : [];
                $row['link'] = !empty($row['project_url']) ? $row['project_url'] : '#';
                
                // Add github link if exists
                if (!empty($row['github_url'])) {
                    $row['github'] = $row['github_url'];
                }
                
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
