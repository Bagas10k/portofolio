<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper to read/write JSON
function getEducationData() {
    if (!file_exists(EDUCATION_FILE)) return [];
    $content = file_get_contents(EDUCATION_FILE);
    return json_decode($content, true) ?? [];
}

function saveEducationData($data) {
    // Ensure directory exists
    $dir = dirname(EDUCATION_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    
    // Ensure parent directory is writable
    if (!is_writable($dir)) {
        chmod($dir, 0777);
    }
    
    $result = file_put_contents(EDUCATION_FILE, json_encode($data, JSON_PRETTY_PRINT));
    
    // Set file permissions if successfully created
    if ($result !== false && file_exists(EDUCATION_FILE)) {
        chmod(EDUCATION_FILE, 0666);
    }
    
    return $result;
}

// GET
if ($method === 'GET') {
    $data = getEducationData();
    // Sort by year DESC
    usort($data, function($a, $b) {
        return strcmp($b['year'], $a['year']);
    });
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

    $data = getEducationData();
    
    $newEdu = [
        'id' => (string)time(), // Simple ID
        'school' => $school,
        'degree' => $degree,
        'year' => $year,
        'description' => $desc
    ];

    $data[] = $newEdu;
    
    if (saveEducationData($data)) {
        echo json_encode(['success' => true]);
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
    
    $data = getEducationData();
    $found = false;
    
    // Filter out the item to delete
    $newData = [];
    foreach($data as $item) {
        if ($item['id'] != $id) {
            $newData[] = $item;
        } else {
            $found = true;
        }
    }

    if ($found) {
        if (saveEducationData($newData)) {
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
