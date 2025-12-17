<?php
// check_tables.php
require_once 'api/config.php';

// Enable errors for this script only to see what's wrong
ini_set('display_errors', 1);

echo "<h1>Database Table Check</h1>";

if ($conn->connect_error) {
    die("<p style='color:red'>Connection Failed: " . $conn->connect_error . "</p>");
}
echo "<p style='color:green'>Connection OK.</p>";

$tables = ['projects', 'skills', 'messages', 'profile'];
foreach ($tables as $t) {
    if ($result = $conn->query("SHOW TABLES LIKE '$t'")) {
        if($result->num_rows == 1) {
            echo "<p>[OK] Table <b>$t</b> exists.</p>";
            
            // Check count
            $count = $conn->query("SELECT COUNT(*) as c FROM $t")->fetch_assoc()['c'];
            echo "<ul><li>Rows: $count</li></ul>";
            
        } else {
            echo "<p style='color:red'>[MISSING] Table <b>$t</b> DOES NOT EXIST. Did you import database.sql?</p>";
        }
    } else {
        echo "<p style='color:red'>Error checking table $t: " . $conn->error . "</p>";
    }
}
?>
