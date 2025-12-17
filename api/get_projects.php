<?php
require_once 'config.php';

$sql = "SELECT * FROM projects ORDER BY id DESC";
$result = $conn->query($sql);

$projects = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Convert comma-separated string back to array for frontend
        $row['tags'] = $row['tags'] ? explode(',', $row['tags']) : [];
        $projects[] = $row;
    }
}

echo json_encode($projects);
$conn->close();
?>
