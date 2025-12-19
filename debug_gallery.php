<?php
/**
 * Gallery Upload Debug Tool
 * Check upload configuration and permissions
 */
?>
<!DOCTYPE html>
<html>
<head>
    <title>Gallery Upload Debug</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
        .success { color: #00ff00; }
        .error { color: #ff4444; }
        .warning { color: #ffaa00; }
        .section { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 5px; }
        h2 { color: #00aaff; }
    </style>
</head>
<body>
    <h1>🔍 Gallery Upload Diagnostic</h1>
    
    <div class="section">
        <h2>1. PHP Upload Configuration</h2>
        <?php
        $upload_max = ini_get('upload_max_filesize');
        $post_max = ini_get('post_max_size');
        $tmp_dir = ini_get('upload_tmp_dir');
        
        echo "<p>upload_max_filesize: <strong>$upload_max</strong></p>";
        echo "<p>post_max_size: <strong>$post_max</strong></p>";
        echo "<p>upload_tmp_dir: <strong>" . ($tmp_dir ?: '/tmp') . "</strong></p>";
        
        if (intval($upload_max) >= 10) {
            echo "<p class='success'>✅ Upload size limit is OK</p>";
        } else {
            echo "<p class='warning'>⚠️ Upload size might be too small for 10MB files</p>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>2. Upload Directory Check</h2>
        <?php
        $uploadDir = 'assets/images/gallery/';
        $fullPath = __DIR__ . '/' . $uploadDir;
        
        echo "<p>Directory: <strong>$uploadDir</strong></p>";
        echo "<p>Full path: <strong>$fullPath</strong></p>";
        
        if (file_exists($uploadDir)) {
            echo "<p class='success'>✅ Directory exists</p>";
            
            if (is_writable($uploadDir)) {
                echo "<p class='success'>✅ Directory is writable</p>";
            } else {
                echo "<p class='error'>❌ Directory is NOT writable</p>";
                echo "<p class='warning'>Fix: chmod 755 $fullPath</p>";
            }
            
            $perms = substr(sprintf('%o', fileperms($uploadDir)), -4);
            echo "<p>Permissions: <strong>$perms</strong></p>";
            
        } else {
            echo "<p class='error'>❌ Directory does NOT exist</p>";
            echo "<p>Attempting to create...</p>";
            
            if (mkdir($uploadDir, 0777, true)) {
                echo "<p class='success'>✅ Directory created</p>";
            } else {
                echo "<p class='error'>❌ Failed to create directory</p>";
                echo "<p class='warning'>Create manually: mkdir -p $fullPath && chmod 755 $fullPath</p>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>3. Database Connection</h2>
        <?php
        require_once 'api/config.php';
        
        if (defined('DB_ERROR') && DB_ERROR) {
            echo "<p class='error'>❌ Database connection FAILED</p>";
        } else {
            echo "<p class='success'>✅ Database connected</p>";
            
            // Check if gallery table exists
            $check = $conn->query("SHOW TABLES LIKE 'gallery'");
            if ($check && $check->num_rows > 0) {
                echo "<p class='success'>✅ Gallery table exists</p>";
            } else {
                echo "<p class='error'>❌ Gallery table does NOT exist</p>";
                echo "<p class='warning'>Run: create_gallery_table.php</p>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>4. Test Upload</h2>
        <form method="post" enctype="multipart/form-data">
            <p>
                <input type="file" name="test_image" accept="image/*">
                <button type="submit" name="test_upload">Test Upload</button>
            </p>
        </form>
        
        <?php
        if (isset($_POST['test_upload']) && isset($_FILES['test_image'])) {
            echo "<h3>Upload Test Results:</h3>";
            
            $file = $_FILES['test_image'];
            echo "<p>Name: <strong>{$file['name']}</strong></p>";
            echo "<p>Size: <strong>" . number_format($file['size']) . " bytes</strong></p>";
            echo "<p>Type: <strong>{$file['type']}</strong></p>";
            echo "<p>Error: <strong>{$file['error']}</strong></p>";
            
            if ($file['error'] === UPLOAD_ERR_OK) {
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $testFile = 'assets/images/gallery/test_' . time() . '.' . $ext;
                
                if (move_uploaded_file($file['tmp_name'], $testFile)) {
                    echo "<p class='success'>✅ Upload SUCCESS!</p>";
                    echo "<p>File saved: <strong>$testFile</strong></p>";
                    
                    // Delete test file
                    if (unlink($testFile)) {
                        echo "<p class='success'>✅ Test file deleted</p>";
                    }
                } else {
                    echo "<p class='error'>❌ Upload FAILED</p>";
                    echo "<p class='error'>Could not move file</p>";
                }
            } else {
                echo "<p class='error'>❌ Upload error: " . $file['error'] . "</p>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>5. Fix Commands</h2>
        <p>If upload fails, try these commands via SSH:</p>
        <pre style="background: #1a1a1a; padding: 10px; border-radius: 5px;">
# Create directory
mkdir -p assets/images/gallery

# Set permissions
chmod 755 assets/images/gallery

# Set owner (if needed)
chown www-data:www-data assets/images/gallery

# Or for CyberPanel
chown lscpd:lscpd assets/images/gallery
        </pre>
    </div>
</body>
</html>
