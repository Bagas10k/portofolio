<?php
/**
 * Database Migration: Create Gallery Table
 * Run this file ONCE to create the gallery table
 */

require_once 'api/config.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Create Gallery Table</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
        .success { color: #00ff00; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
        .error { color: #ff4444; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
        .info { color: #00aaff; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔧 Database Migration: Create Gallery Table</h1>
";

if (defined('DB_ERROR') && DB_ERROR) {
    echo "<div class='error'>❌ Database connection failed. Please check your config.php</div>";
    echo "</body></html>";
    exit;
}

// Check if gallery table already exists
$checkTable = $conn->query("SHOW TABLES LIKE 'gallery'");

if ($checkTable && $checkTable->num_rows > 0) {
    echo "<div class='info'>ℹ️ Gallery table already exists.</div>";
    
    // Show table structure
    $columns = $conn->query("SHOW COLUMNS FROM gallery");
    if ($columns) {
        echo "<div class='info'><h2>Current Table Structure:</h2>";
        echo "<table border='1' cellpadding='5' style='border-collapse: collapse; color: #00ff00;'>";
        echo "<tr style='background: #333;'><th>Field</th><th>Type</th><th>Null</th><th>Default</th></tr>";
        while ($col = $columns->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $col['Field'] . "</td>";
            echo "<td>" . $col['Type'] . "</td>";
            echo "<td>" . $col['Null'] . "</td>";
            echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
            echo "</tr>";
        }
        echo "</table></div>";
    }
    
    // Show current images
    $images = $conn->query("SELECT COUNT(*) as count FROM gallery");
    if ($images) {
        $row = $images->fetch_assoc();
        echo "<div class='success'>📸 Current images in gallery: " . $row['count'] . "</div>";
    }
    
} else {
    echo "<div class='info'>📋 Creating 'gallery' table...</div>";
    
    $sql = "CREATE TABLE IF NOT EXISTS `gallery` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `filename` varchar(255) NOT NULL,
        `filepath` varchar(255) NOT NULL,
        `filesize` int(11) NOT NULL,
        `filetype` varchar(50) NOT NULL,
        `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    if ($conn->query($sql)) {
        echo "<div class='success'>✅ Successfully created 'gallery' table!</div>";
        echo "<div class='info'>
            <p><strong>Table Details:</strong></p>
            <ul>
                <li>Name: gallery</li>
                <li>Columns: id, filename, filepath, filesize, filetype, created_at</li>
                <li>Engine: InnoDB</li>
                <li>Charset: utf8mb4</li>
            </ul>
        </div>";
    } else {
        echo "<div class='error'>❌ Error creating table: " . $conn->error . "</div>";
    }
}

// Check/create upload directory
echo "<div class='info'><h2>📁 Upload Directory:</h2>";
$galleryDir = 'assets/images/gallery/';
if (file_exists($galleryDir)) {
    echo "<p class='success'>✅ Directory exists: $galleryDir</p>";
    $perms = substr(sprintf('%o', fileperms($galleryDir)), -4);
    echo "<p>Permissions: <strong>$perms</strong></p>";
    
    if (is_writable($galleryDir)) {
        echo "<p class='success'>✅ Directory is writable</p>";
    } else {
        echo "<p class='error'>❌ Directory is NOT writable. Run: chmod 755 $galleryDir</p>";
    }
} else {
    echo "<p class='error'>❌ Directory does not exist. Creating...</p>";
    if (mkdir($galleryDir, 0777, true)) {
        echo "<p class='success'>✅ Directory created: $galleryDir</p>";
    } else {
        echo "<p class='error'>❌ Failed to create directory</p>";
    }
}
echo "</div>";

$conn->close();

echo "
    <div class='success'>
        <h2>✅ Migration Complete!</h2>
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Go to Admin Panel → Gallery</li>
            <li>Drag & drop images or click to browse</li>
            <li>Upload multiple images at once</li>
            <li>Use 'Copy URL' to get image links</li>
            <li>Delete images you don't need</li>
        </ol>
        <p><a href='admin/gallery.html' style='color: #64dbee;'>→ Go to Gallery Manager</a></p>
    </div>
</body>
</html>";
?>
