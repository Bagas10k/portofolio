<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

function getSkillsData() {
    if (!file_exists(SKILLS_FILE)) return [];
    $content = file_get_contents(SKILLS_FILE);
    return json_decode($content, true) ?? [];
}

function saveSkillsData($data) {
    // Ensure directory exists
    $dir = dirname(SKILLS_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    
    // Ensure parent directory is writable
    if (!is_writable($dir)) {
        chmod($dir, 0777);
    }
    
    $result = file_put_contents(SKILLS_FILE, json_encode($data, JSON_PRETTY_PRINT));
    
    // Set file permissions if successfully created
    if ($result !== false && file_exists(SKILLS_FILE)) {
        chmod(SKILLS_FILE, 0666);
    }
    
    return $result;
}

// GET
if ($method === 'GET') {
    $data = getSkillsData();
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
    $name = $input['name'] ?? '';
    $category = $input['category'] ?? 'Development';
    $icon = $input['icon'] ?? 'Code';

    if (!$name) {
        echo json_encode(['success'=>false, 'message'=>'Name required']);
        exit;
    }

    $data = getSkillsData();
    
    $newSkill = [
        'id' => (string)time(),
        'name' => $name,
        'category' => $category,
        'icon' => $icon
    ];

    $data[] = $newSkill;
    
    if (saveSkillsData($data)) {
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
    $data = getSkillsData();
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
        if (saveSkillsData($newData)) {
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
