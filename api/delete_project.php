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

    $json_data = file_get_contents(DATA_FILE);
    $projects = json_decode($json_data, true);

    // Find the project to delete (to delete image if needed)
    $projectIndex = -1;
    $projectImage = null;

    foreach ($projects as $index => $p) {
        if ($p['id'] === $id) {
            $projectIndex = $index;
            $projectImage = $p['image'];
            break;
        }
    }

    if ($projectIndex > -1) {
        // Remove from array
        array_splice($projects, $projectIndex, 1);
        
        // Save JSON
        file_put_contents(DATA_FILE, json_encode($projects, JSON_PRETTY_PRINT));

        // Delete image file if exists and is not external
        if ($projectImage && file_exists('../' . $projectImage)) {
            unlink('../' . $projectImage);
        }

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Project not found']);
    }
}
?>
