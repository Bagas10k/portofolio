<?php
/**
 * Database Migration: Add Avatar Column to Profile Table
 * Run this file ONCE to add the avatar column
 */

require_once 'api/config.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Add Avatar Column</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
        .success { color: #00ff00; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
        .error { color: #ff4444; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
        .info { color: #00aaff; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔧 Database Migration: Add Avatar Column</h1>
";

if (defined('DB_ERROR') && DB_ERROR) {
    echo "<div class='error'>❌ Database connection failed. Please check your config.php</div>";
    echo "</body></html>";
    exit;
}

// Check if avatar column already exists
$checkColumn = $conn->query("SHOW COLUMNS FROM profile LIKE 'avatar'");

if ($checkColumn && $checkColumn->num_rows > 0) {
    echo "<div class='info'>ℹ️ Column 'avatar' already exists in profile table.</div>";
    
    // Show current avatar value
    $result = $conn->query("SELECT id, name, avatar FROM profile WHERE id=1");
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo "<div class='info'>";
        echo "<p><strong>Current profile data:</strong></p>";
        echo "<p>ID: " . $row['id'] . "</p>";
        echo "<p>Name: " . $row['name'] . "</p>";
        echo "<p>Avatar: " . ($row['avatar'] ? $row['avatar'] : '<em>NULL</em>') . "</p>";
        echo "</div>";
    }
} else {
    echo "<div class='info'>📋 Adding 'avatar' column to profile table...</div>";
    
    // Add avatar column
    $sql = "ALTER TABLE profile ADD COLUMN avatar VARCHAR(255) DEFAULT NULL AFTER about_text";
    
    if ($conn->query($sql)) {
        echo "<div class='success'>✅ Successfully added 'avatar' column to profile table!</div>";
        echo "<div class='info'>
            <p><strong>Column Details:</strong></p>
            <p>Name: avatar</p>
            <p>Type: VARCHAR(255)</p>
            <p>Default: NULL</p>
            <p>Position: After about_text</p>
        </div>";
    } else {
        echo "<div class='error'>❌ Error adding column: " . $conn->error . "</div>";
    }
}

// Show final table structure
echo "<div class='info'><h2>📊 Current Profile Table Structure:</h2>";
$columns = $conn->query("SHOW COLUMNS FROM profile");
if ($columns) {
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
    echo "</table>";
}
echo "</div>";

// Check if avatar file exists
echo "<div class='info'><h2>📁 Check Avatar Files:</h2>";
$avatarDir = 'assets/images/profile/';
if (file_exists($avatarDir)) {
    $files = scandir($avatarDir);
    $avatarFiles = array_filter($files, function($file) {
        return preg_match('/^avatar\.(jpg|jpeg|png|webp)$/i', $file);
    });
    
    if (count($avatarFiles) > 0) {
        echo "<p class='success'>✅ Found avatar file(s):</p>";
        foreach ($avatarFiles as $file) {
            $fullPath = $avatarDir . $file;
            $size = filesize($fullPath);
            echo "<p>📸 " . $file . " (" . number_format($size) . " bytes)</p>";
            
            // Update database with this file
            $avatarPath = 'assets/images/profile/' . $file;
            $updateSql = "UPDATE profile SET avatar = ? WHERE id = 1";
            $stmt = $conn->prepare($updateSql);
            $stmt->bind_param("s", $avatarPath);
            if ($stmt->execute()) {
                echo "<p class='success'>✅ Updated database with avatar path: $avatarPath</p>";
            }
        }
    } else {
        echo "<p class='error'>❌ No avatar file found. Upload one from admin panel.</p>";
    }
} else {
    echo "<p class='error'>❌ Avatar directory does not exist: $avatarDir</p>";
}
echo "</div>";

$conn->close();

echo "
    <div class='success'>
        <h2>✅ Migration Complete!</h2>
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Go to Admin Panel → Profile</li>
            <li>Upload an avatar image</li>
            <li>Click 'Save Changes'</li>
            <li>Refresh homepage to see your avatar!</li>
        </ol>
    </div>
</body>
</html>";
?>
