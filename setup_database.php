<?php
require_once 'api/config.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Setup</title>
    <style>
        body { font-family: sans-serif; background: #1a1a1a; color: #fff; padding: 20px; line-height: 1.6; }
        .success { color: #4caf50; }
        .error { color: #ff5252; }
        .info { color: #2196f3; }
        .card { background: #333; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>🚀 Database Installation & Update</h1>";

function runQuery($conn, $sql, $successMsg) {
    if ($conn->query($sql) === TRUE) {
        echo "<div class='card success'>✅ $successMsg</div>";
    } else {
        // If error is "Duplicate column name", it means already updated, which is fine/info
        if(strpos($conn->error, "Duplicate column name") !== false) {
             echo "<div class='card info'>ℹ️ $successMsg (Already exists)</div>";
        } elseif(strpos($conn->error, "Table") !== false && strpos($conn->error, "already exists") !== false) {
             echo "<div class='card info'>ℹ️ $successMsg (Already exists)</div>";
        } else {
             echo "<div class='card error'>❌ Error: " . $conn->error . "</div>";
        }
    }
}

// 1. Projects Table
$sql = "CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) NOT NULL,
  `tags` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT '#',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
runQuery($conn, $sql, "Table 'projects' created");

// 2. Skills Table
$sql = "CREATE TABLE IF NOT EXISTS `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
runQuery($conn, $sql, "Table 'skills' created");

// 3. Messages Table
$sql = "CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
runQuery($conn, $sql, "Table 'messages' created");

// 4. Education Table (New)
$sql = "CREATE TABLE IF NOT EXISTS `education` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school` varchar(255) NOT NULL,
  `degree` varchar(255) NOT NULL,
  `year` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
runQuery($conn, $sql, "Table 'education' created");

// 5. Profile Table
$sql = "CREATE TABLE IF NOT EXISTS `profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  `tagline` text NOT NULL,
  `about_text` text NOT NULL,
  `avatar` varchar(255) DEFAULT 'assets/images/profile/avatar.png',
  `years_exp` varchar(20) DEFAULT '0',
  `projects_count` varchar(20) DEFAULT '0',
  `email` varchar(100) NOT NULL,
  `linkedin` varchar(255) DEFAULT '',
  `github` varchar(255) DEFAULT '',
  `dribbble` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
runQuery($conn, $sql, "Table 'profile' created");

// 5.1 Insert Default Profile if empty
$check = $conn->query("SELECT id FROM profile WHERE id=1");
if ($check->num_rows == 0) {
    $sql = "INSERT INTO `profile` (`id`, `name`, `role`, `tagline`, `about_text`, `years_exp`, `projects_count`, `email`) 
            VALUES (1, 'Bagas', 'Programmer', 'Welcome to my portfolio', 'I am a programmer.', '1', '5', 'email@example.com')";
    runQuery($conn, $sql, "Default Profile Data Inserted");
}

// 5.2 Update Profile Table (Add Avatar column if missing - for existing DBs)
// We try to add the column; if it exists it will fail gently or we can check.
// Using 'ADD COLUMN IF NOT EXISTS' is MariaDB 10.2+, safe way is check or just try.
// Since runQuery catches errors, we just try to add it.
$sql = "ALTER TABLE profile ADD COLUMN avatar VARCHAR(255) DEFAULT 'assets/images/profile/avatar.png' AFTER about_text";
// Suppress error in runQuery logic implicitly, but let's be cleaner
if(!$conn->query("SELECT avatar FROM profile LIMIT 1")) {
    runQuery($conn, $sql, "Column 'avatar' added to profile");
} else {
    echo "<div class='card info'>ℹ️ Column 'avatar' already exists in profile.</div>";
}

// 6. Ensure Directories Exist
$dirs = [
    'assets/images/projects',
    'assets/images/profile',
    'data' // Backup folder
];

foreach ($dirs as $dir) {
    if (!file_exists($dir)) {
        if(mkdir($dir, 0777, true)) {
            echo "<div class='card success'>✅ Directory '$dir' created.</div>";
        } else {
            echo "<div class='card error'>❌ Failed to create directory '$dir'. Check permissions.</div>";
        }
    } else {
        echo "<div class='card info'>ℹ️ Directory '$dir' exists.</div>";
    }
}

echo "<hr><h3>🎉 All Done! Please delete this file (`setup_database.php`) after use.</h3>";
echo "</body></html>";
$conn->close();
?>
