<?php
// Simple configuration
// CHANGE THIS PASSWORD BEFORE DEPLOYING
define('ADMIN_PASSWORD', 'admin123'); 

// Paths
define('DATA_FILE', '../data/projects.json');
define('SKILLS_FILE', '../data/skills.json');
define('MESSAGES_FILE', '../data/messages.json');
define('PROFILE_FILE', '../data/profile.json');
define('UPLOAD_DIR', '../assets/images/projects/');

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
?>
