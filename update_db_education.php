<?php
require_once 'api/config.php';
ini_set('display_errors', 1);

$sql = "CREATE TABLE IF NOT EXISTS `education` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school` varchar(255) NOT NULL,
  `degree` varchar(255) NOT NULL,
  `year` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql) === TRUE) {
    echo "<h1>Table 'education' created successfully.</h1>";
    echo "<p>You can delete this file now.</p>";
} else {
    echo "Error creating table: " . $conn->error;
}
$conn->close();
?>
