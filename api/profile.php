<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    // We assume ID 1 is the main profile
    $sql = "SELECT * FROM profile WHERE id = 1 LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        // Structure data to match expected frontend format
        $data = [
            'name' => $row['name'],
            'role' => $row['role'],
            'tagline' => $row['tagline'],
            'about_text' => $row['about_text'],
            'years_exp' => $row['years_exp'],
            'projects_count' => $row['projects_count'],
            'email' => $row['email'],
            'socials' => [
                'linkedin' => $row['linkedin'],
                'github' => $row['github'],
                'dribbble' => $row['dribbble']
            ]
        ];
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        echo json_encode(['success' => false, 'data' => []]);
    }
    exit;
}

// POST (Update)
if ($method === 'POST') {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) exit(json_encode(['success'=>false, 'message'=>'Unauthorized']));

    $input = json_decode(file_get_contents('php://input'), true);

    $stmt = $conn->prepare("UPDATE profile SET name=?, role=?, tagline=?, about_text=?, years_exp=?, projects_count=?, email=?, linkedin=?, github=?, dribbble=? WHERE id=1");
    
    $stmt->bind_param("ssssssssss", 
        $input['name'], 
        $input['role'], 
        $input['tagline'], 
        $input['about_text'], 
        $input['years_exp'], 
        $input['projects_count'], 
        $input['email'], 
        $input['linkedin'], 
        $input['github'], 
        $input['dribbble']
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    exit;
}
$conn->close();
?>
