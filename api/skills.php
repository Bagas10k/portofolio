<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper to read/write JSON
function getSkills() {
    if (!file_exists(SKILLS_FILE)) return [];
    $json = file_get_contents(SKILLS_FILE);
    return json_decode($json, true) ?? [];
}

function saveSkills($skills) {
    file_put_contents(SKILLS_FILE, json_encode($skills, JSON_PRETTY_PRINT));
}

// GET: List skills
if ($method === 'GET') {
    $skills = getSkills();
    echo json_encode(['success' => true, 'data' => $skills]);
    exit;
}

// POST: Add skill (Admin only)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $category = $input['category'] ?? 'Development';
    $name = $input['name'] ?? '';
    // icon can be a class name or short text
    $icon = $input['icon'] ?? 'Code'; 

    if (!$name) {
        echo json_encode(['success' => false, 'message' => 'Name required']);
        exit;
    }

    $skills = getSkills();
    $newSkill = [
        'id' => uniqid(),
        'category' => $category,
        'name' => $name,
        'icon' => $icon
    ];
    
    // Add to appropriate category logic or just list?
    // Let's just store flat list with category field
    $skills[] = $newSkill;
    saveSkills($skills);

    echo json_encode(['success' => true, 'data' => $newSkill]);
    exit;
}

// DELETE: Remove skill (Admin only)
if ($method === 'DELETE') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $id = $_GET['id'] ?? '';
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID required']);
        exit;
    }

    $skills = getSkills();
    $skills = array_filter($skills, fn($s) => $s['id'] !== $id);
    saveSkills(array_values($skills));

    echo json_encode(['success' => true]);
    exit;
}
?>
