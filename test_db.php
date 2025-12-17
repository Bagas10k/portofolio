<?php
// test_db.php
// Visit this file to check if your database connection works.

require_once 'api/config.php';

if ($conn->ping()) {
    echo "<h1>Database Connection Successful!</h1>";
    echo "<p>Connected to database: " . DB_NAME . "</p>";
    echo "<p>Host: " . DB_HOST . "</p>";
} else {
    echo "<h1>Connection Failed</h1>";
    echo "<p>Error: " . $conn->error . "</p>";
}
$conn->close();
?>
