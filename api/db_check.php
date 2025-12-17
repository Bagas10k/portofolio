<?php
// api/db_check.php
require_once 'config.php';
header('Content-Type: application/json');

$response = [
    'connected' => false,
    'error' => null,
    'tables' => []
];

if (defined('DB_ERROR') && DB_ERROR) {
    $response['error'] = 'Connection Failed defined in config';
} elseif ($conn->connect_error) {
    $response['error'] = 'Connection Error: ' . $conn->connect_error;
} else {
    $response['connected'] = true;
    
    // Check tables
    $result = $conn->query("SHOW TABLES");
    if ($result) {
        while($row = $result->fetch_array()) {
            $response['tables'][] = $row[0];
        }
    } else {
        $response['error'] = 'Could not list tables: ' . $conn->error;
    }
}

echo json_encode($response);
?>
