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
            // Attempt to create
            if (!mkdir(UPLOAD_DIR, 0777, true)) {
                 echo json_encode(['success' => false, 'message' => 'Failed to create upload folder. Server Permission Denied.']);
                 exit;
            }
        }
        
        // Check strict write permission
        if (!is_writable(UPLOAD_DIR)) {
             echo json_encode(['success' => false, 'message' => 'Upload folder is NOT writable. Please Run: chmod 777 assets/images/projects']);
             exit;
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
                // Delete uploaded file if DB insert fails to keep clean
                unlink($dest_path);
                echo json_encode(['success' => false, 'message' => 'Database Insert Failed: ' . $stmt->error]);
            }
            $stmt->close();
        } else {
            $err = error_get_last();
            echo json_encode(['success' => false, 'message' => 'Move File Failed. Reason: ' . ($err['message'] ?? 'Unknown')]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    }
}
$conn->close();
?>
