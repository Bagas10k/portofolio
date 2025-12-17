<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

function getMessages() {
    if (!file_exists(MESSAGES_FILE)) return [];
    $json = file_get_contents(MESSAGES_FILE);
    return json_decode($json, true) ?? [];
}

function saveMessages($msgs) {
    file_put_contents(MESSAGES_FILE, json_encode($msgs, JSON_PRETTY_PRINT));
}

// GET: List messages (Admin only)
if ($method === 'GET') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $messages = getMessages();
    // Sort by date desc (assuming we add date)
    usort($messages, fn($a, $b) => strtotime($b['date']) - strtotime($a['date']));
    
    echo json_encode(['success' => true, 'data' => $messages]);
    exit;
}

// POST: Submit message (Public)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $message = $input['message'] ?? '';

    if (!$name || !$email || !$message) {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit;
    }

    $msgs = getMessages();
    $newMsg = [
        'id' => uniqid(),
        'name' => htmlspecialchars($name),
        'email' => htmlspecialchars($email),
        'message' => htmlspecialchars($message),
        'date' => date('Y-m-d H:i:s')
    ];

    array_unshift($msgs, $newMsg);
    saveMessages($msgs);

    echo json_encode(['success' => true, 'message' => 'Message sent']);
    exit;
}
?>
