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
    $tagsRaw = $_POST['tags'] ?? ''; 
    $link = $_POST['link'] ?? '#';
    
    // Parse tags: user might send "tag1, tag2" string
    // Front end sends string. The JSON stores ARRAY.
    // So we should explode it here.
    $tagsArray = $tagsRaw ? array_map('trim', explode(',', $tagsRaw)) : [];


    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['image']['tmp_name'];
        $fileName = $_FILES['image']['name'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        
        if (!is_dir(UPLOAD_DIR)) {
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

        // OPTIMIZATION: Resize/Compress Image
        $uploaded = $fileTmpPath;
        // Check if getimagesize succeeds
        $imageInfo = @getimagesize($uploaded);
        if (!$imageInfo) {
             echo json_encode(['success' => false, 'message' => 'Invalid image file']);
             exit;
        }
        
        list($width, $height) = $imageInfo;
        $max_width = 800; 

        $moved = false;

        if ($width > $max_width) {
            $ratio = $max_width / $width;
            $new_width = $max_width;
            $new_height = $height * $ratio;

            $src = imagecreatefromstring(file_get_contents($uploaded));
            if ($src) {
                $dst = imagecreatetruecolor($new_width, $new_height);
                
                // Maintain transparency
                imagealphablending($dst, false);
                imagesavealpha($dst, true);

                imagecopyresampled($dst, $src, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
                
                switch($fileExtension) {
                    case 'png': imagepng($dst, $dest_path, 8); break; 
                    case 'jpg': case 'jpeg': imagejpeg($dst, $dest_path, 85); break;
                    case 'webp': imagewebp($dst, $dest_path, 85); break;
                    default: 
                        // If standard GD unsupported, try move
                        imagedestroy($dst); imagedestroy($src);
                        if(move_uploaded_file($uploaded, $dest_path)) $moved = true;
                        break;
                }
                
                if (!$moved && file_exists($dest_path)) {
                    $moved = true; // GD saved it
                }
                
                if (isset($src)) imagedestroy($src);
                if (isset($dst)) imagedestroy($dst);
            } else {
                // GD failed, fallback
                 if(move_uploaded_file($uploaded, $dest_path)) $moved = true;
            }
        } else {
            if(move_uploaded_file($uploaded, $dest_path)) $moved = true;
        }

        if($moved) {
            // Save to database instead of JSON
            $tagsString = implode(',', $tagsArray); // Convert array back to comma-separated
            
            $stmt = $conn->prepare("INSERT INTO projects (title, description, image, tags, link) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sssss", $title, $desc, $db_image_path, $tagsString, $link);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                // Delete uploaded image if DB insert fails
                unlink($dest_path);
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
            }
        } else {
            $err = error_get_last();
            echo json_encode(['success' => false, 'message' => 'Move File Failed. ' . ($err['message'] ?? '')]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    }
}
?>
