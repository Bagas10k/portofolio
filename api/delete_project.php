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

    if (!file_exists(PROJECTS_FILE)) {
        echo json_encode(['success' => false, 'message' => 'Project file not found']);
        exit;
    }

    $json_content = file_get_contents(PROJECTS_FILE);
    $projects = json_decode($json_content, true) ?? [];
    
    $foundIndex = -1;
    $projectToDelete = null;

    // Find project by ID
    foreach ($projects as $index => $project) {
        if ($project['id'] == $id) {
            $foundIndex = $index;
            $projectToDelete = $project;
            break;
        }
    }

    if ($foundIndex !== -1) {
        // Delete Image
        if (!empty($projectToDelete['image'])) {
             $imagePath = '../' . $projectToDelete['image'];
             if (file_exists($imagePath)) {
                 unlink($imagePath);
             }
        }

        // Remove from Array
        array_splice($projects, $foundIndex, 1);

        // Save back to JSON
        if (file_put_contents(PROJECTS_FILE, json_encode($projects, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save changes']);
        }

    } else {
        echo json_encode(['success' => false, 'message' => 'Project not found with ID: ' . $id]);
    }
}
?>
