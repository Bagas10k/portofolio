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
// Security and Cache headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
?>
