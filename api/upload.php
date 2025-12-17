<?php
session_start();
require_once 'config.php';

// Check auth (simple session check)
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $desc = $_POST['desc'] ?? '';
    $tags = $_POST['tags'] ?? '';
    $link = $_POST['link'] ?? '#';

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['image']['tmp_name'];
        $fileName = $_FILES['image']['name'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        $dest_path = UPLOAD_DIR . $newFileName;

        if(move_uploaded_file($fileTmpPath, $dest_path)) {
            // Read JSON
            $json_data = file_get_contents(DATA_FILE);
            $projects = json_decode($json_data, true);

            // Add new project
            $new_project = [
                "id" => uniqid(),
                "title" => $title,
                "desc" => $desc,
                "image" => "assets/images/projects/" . $newFileName,
                "link" => $link,
                "tags" => array_map('trim', explode(',', $tags))
            ];

            array_unshift($projects, $new_project); // Add to beginning

            // Save JSON
            file_put_contents(DATA_FILE, json_encode($projects, JSON_PRETTY_PRINT));

            echo json_encode(['success' => true, 'project' => $new_project]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error moving file']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    }
}
?>
