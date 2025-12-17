<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $desc = $_POST['desc'] ?? '';
    $tags = $_POST['tags'] ?? ''; // Kept as string
    $link = $_POST['link'] ?? '#';

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['image']['tmp_name'];
        $fileName = $_FILES['image']['name'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        
        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }

        $dest_path = UPLOAD_DIR . $newFileName;
        $db_image_path = "assets/images/projects/" . $newFileName;

        if(move_uploaded_file($fileTmpPath, $dest_path)) {
            
            // Insert into Database
            $stmt = $conn->prepare("INSERT INTO projects (title, description, image, tags, link) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sssss", $title, $desc, $db_image_path, $tags, $link);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'DB Error: ' . $stmt->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Error moving file']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    }
}
$conn->close();
?>
