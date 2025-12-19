<?php
// Debug tool for checking upload configuration and permissions
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Avatar Upload Debug</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
        .section { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { color: #00ff00; }
        .error { color: #ff4444; }
        .warning { color: #ffaa00; }
        h2 { color: #00aaff; }
    </style>
</head>
<body>
    <h1>🔍 Avatar Upload Diagnostic Tool</h1>
    
    <div class="section">
        <h2>1. Upload Configuration</h2>
        <?php
        $upload_max = ini_get('upload_max_filesize');
        $post_max = ini_get('post_max_size');
        $memory_limit = ini_get('memory_limit');
        
        echo "<p>upload_max_filesize: <strong>$upload_max</strong></p>";
        echo "<p>post_max_size: <strong>$post_max</strong></p>";
        echo "<p>memory_limit: <strong>$memory_limit</strong></p>";
        
        if (intval($upload_max) < 5) {
            echo "<p class='warning'>⚠️ Warning: upload_max_filesize is less than 5MB</p>";
        } else {
            echo "<p class='success'>✅ upload_max_filesize is OK</p>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>2. Directory Check</h2>
        <?php
        $uploadDir = 'assets/images/profile/';
        $fullPath = __DIR__ . '/' . $uploadDir;
        
        echo "<p>Upload directory: <strong>$fullPath</strong></p>";
        
        if (file_exists($uploadDir)) {
            echo "<p class='success'>✅ Directory exists</p>";
            
            if (is_writable($uploadDir)) {
                echo "<p class='success'>✅ Directory is writable</p>";
            } else {
                echo "<p class='error'>❌ Directory is NOT writable</p>";
                echo "<p class='warning'>Fix: chmod 755 $fullPath</p>";
            }
            
            $perms = substr(sprintf('%o', fileperms($uploadDir)), -4);
            echo "<p>Current permissions: <strong>$perms</strong></p>";
            
        } else {
            echo "<p class='error'>❌ Directory does NOT exist</p>";
            echo "<p>Attempting to create...</p>";
            
            if (mkdir($uploadDir, 0777, true)) {
                echo "<p class='success'>✅ Directory created successfully</p>";
            } else {
                echo "<p class='error'>❌ Failed to create directory</p>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>3. Existing Avatar</h2>
        <?php
        require_once 'api/config.php';
        
        $result = $conn->query("SELECT avatar FROM profile WHERE id=1 LIMIT 1");
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $avatar = $row['avatar'];
            
            echo "<p>Current avatar in DB: <strong>$avatar</strong></p>";
            
            if ($avatar && file_exists($avatar)) {
                echo "<p class='success'>✅ Avatar file exists</p>";
                $size = filesize($avatar);
                echo "<p>File size: <strong>" . number_format($size) . " bytes</strong></p>";
                
                if (is_writable($avatar)) {
                    echo "<p class='success'>✅ Avatar file is writable (can be deleted)</p>";
                } else {
                    echo "<p class='warning'>⚠️ Avatar file is NOT writable</p>";
                }
            } else {
                echo "<p class='warning'>⚠️ Avatar file does not exist on disk</p>";
            }
        } else {
            echo "<p class='warning'>⚠️ No profile found in database</p>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>4. Test File Upload</h2>
        <form method="post" enctype="multipart/form-data">
            <p>
                <input type="file" name="test_avatar" accept="image/*">
                <button type="submit" name="test_upload">Test Upload</button>
            </p>
        </form>
        
        <?php
        if (isset($_POST['test_upload']) && isset($_FILES['test_avatar'])) {
            echo "<h3>Upload Test Results:</h3>";
            
            $file = $_FILES['test_avatar'];
            echo "<p>Original name: <strong>{$file['name']}</strong></p>";
            echo "<p>Size: <strong>" . number_format($file['size']) . " bytes</strong></p>";
            echo "<p>Type: <strong>{$file['type']}</strong></p>";
            echo "<p>Tmp name: <strong>{$file['tmp_name']}</strong></p>";
            echo "<p>Error code: <strong>{$file['error']}</strong></p>";
            
            if ($file['error'] === UPLOAD_ERR_OK) {
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $testFile = 'assets/images/profile/test_upload.' . $ext;
                
                if (move_uploaded_file($file['tmp_name'], $testFile)) {
                    echo "<p class='success'>✅ Test upload SUCCESS!</p>";
                    echo "<p>Saved to: <strong>$testFile</strong></p>";
                    
                    // Delete test file
                    if (unlink($testFile)) {
                        echo "<p class='success'>✅ Test file deleted</p>";
                    }
                } else {
                    echo "<p class='error'>❌ Test upload FAILED!</p>";
                    echo "<p class='error'>Could not move uploaded file</p>";
                }
            } else {
                echo "<p class='error'>❌ Upload error: " . $file['error'] . "</p>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>5. Error Logs Location</h2>
        <p>Check server error logs here:</p>
        <ul>
            <li>Apache: /var/log/apache2/error.log</li>
            <li>CyberPanel: /usr/local/lsws/logs/error.log</li>
            <li>PHP: <?php echo ini_get('error_log'); ?></li>
        </ul>
        <p class='warning'>Run this command to see recent errors:</p>
        <code>tail -f /var/log/apache2/error.log | grep avatar</code>
    </div>
</body>
</html>
