<?php
require_once 'config.php';

// Check if JSON file exists
if (file_exists(PROJECTS_FILE)) {
    $json_content = file_get_contents(PROJECTS_FILE);
    $projects = json_decode($json_content, true);
    
    if ($projects === null) {
        // If JSON is invalid, return empty array
        $projects = [];
    }
} else {
    // If file doesn't exist, return empty array
    $projects = [];
}

// Convert "desc" to "description" if needed? 
// No, the frontend expects "desc" (based on projects.js checking p.desc).
// The JSON has "desc".
// The previous DB code selected *, so it returned "description" if the column was named description.
// But projects.js used p.desc. So the DB code WAS BROKEN automatically if it returned description.
// By using JSON directly which has "desc", we fix the property name issue too.

// Return data
echo json_encode($projects);
?>
