<?php
require_once 'api/config.php';
ini_set('display_errors', 1);

// Add avatar column if not exists
$sql = "ALTER TABLE profile ADD COLUMN avatar VARCHAR(255) DEFAULT 'assets/images/profile/avatar.png' AFTER about_text";

if ($conn->query($sql) === TRUE) {
    echo "<h1>Column 'avatar' added successfully.</h1>";
} else {
    // Ignore error if column exists (simple way) or check specifically
    echo "<h1>Process finished (Column might already exist).</h1> Error: " . $conn->error;
}

// Ensure directory exists
$dir = 'assets/images/profile/';
if (!file_exists($dir)) {
    mkdir($dir, 0777, true);
    echo "<p>Directory $dir created.</p>";
} else {
    echo "<p>Directory $dir already exists.</p>";
}

$conn->close();
?>
