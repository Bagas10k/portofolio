<?php
// install_db.php
// Run this to create tables automatically.

require_once 'api/config.php';
ini_set('display_errors', 1);

echo "<h1>Installing Database Tables...</h1>";

$queries = [
    "CREATE TABLE IF NOT EXISTS `projects` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `title` varchar(255) NOT NULL,
      `description` text NOT NULL,
      `image` varchar(255) NOT NULL,
      `tags` varchar(255) NOT NULL,
      `link` varchar(255) DEFAULT '#',
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

    "CREATE TABLE IF NOT EXISTS `skills` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `category` varchar(50) NOT NULL,
      `name` varchar(100) NOT NULL,
      `icon` varchar(50) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

    "CREATE TABLE IF NOT EXISTS `messages` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(100) NOT NULL,
      `email` varchar(100) NOT NULL,
      `message` text NOT NULL,
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

    "CREATE TABLE IF NOT EXISTS `profile` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(100) NOT NULL,
      `role` varchar(100) NOT NULL,
      `tagline` text NOT NULL,
      `about_text` text NOT NULL,
      `years_exp` varchar(20) DEFAULT '0',
      `projects_count` varchar(20) DEFAULT '0',
      `email` varchar(100) NOT NULL,
      `linkedin` varchar(255) DEFAULT '',
      `github` varchar(255) DEFAULT '',
      `dribbble` varchar(255) DEFAULT '',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

    "INSERT IGNORE INTO `profile` (`id`, `name`, `role`, `tagline`, `about_text`, `years_exp`, `projects_count`, `email`) 
    VALUES (1, 'Bagas', 'Programmer', 'Welcome to my portfolio', 'I am a programmer.', '1', '5', 'email@example.com');"
];

foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color:green'>[SUCCESS] Query executed successfully.</p>";
    } else {
        echo "<p style='color:red'>[ERROR] " . $conn->error . "</p>";
    }
}

echo "<h2>Installation Complete!</h2>";
echo "<p>Please delete this file (install_db.php) immediately.</p>";
echo "<a href='admin/dashboard.html'>Go to Dashboard</a>";
?>
