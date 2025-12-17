<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

function getMessagesData() {
    if (!file_exists(MESSAGES_FILE)) return [];
    $content = file_get_contents(MESSAGES_FILE);
    return json_decode($content, true) ?? [];
}

function saveMessagesData($data) {
    // Ensure directory exists
    $dir = dirname(MESSAGES_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    
    // Ensure parent directory is writable
    if (!is_writable($dir)) {
        chmod($dir, 0777);
    }
    
    $result = file_put_contents(MESSAGES_FILE, json_encode($data, JSON_PRETTY_PRINT));
    
    // Set file permissions if successfully created
    if ($result !== false && file_exists(MESSAGES_FILE)) {
        chmod(MESSAGES_FILE, 0666);
    }
    
    return $result;
}

// GET
if ($method === 'GET') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $data = getMessagesData();
    // Sort by created_at DESC (simulated by array_reverse if simple append, else we need dates)
    // For simplicity, we just reverse key order (newest is last added)
    $data = array_reverse($data);
    
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

// POST
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $message = $input['message'] ?? '';
    
    if (!$name || !$email || !$message) {
        echo json_encode(['success'=>false, 'message'=>'All fields required']);
        exit;
    }

    $data = getMessagesData();
    
    $newMsg = [
        'id' => (string)time(),
        'name' => $name,
        'email' => $email,
        'message' => $message,
        'created_at' => date('Y-m-d H:i:s')
    ];

    $data[] = $newMsg;
    
    if (saveMessagesData($data)) {
        echo json_encode(['success' => true, 'message' => 'Sent']);
    } else {
        $e = error_get_last();
        echo json_encode(['success' => false, 'message' => 'Failed to save: ' . ($e['message'] ?? 'Unknown')]);
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
    
    $data = getMessagesData();
    $found = false;
    $newData = [];

    foreach($data as $item) {
        if ($item['id'] != $id) {
            $newData[] = $item;
        } else {
            $found = true;
        }
    }

    if ($found) {
        if (saveMessagesData($newData)) {
            echo json_encode(['success' => true]);
        } else {
             echo json_encode(['success' => false, 'message' => 'Failed to save']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Item not found']);
    }
    exit;
}
?>
