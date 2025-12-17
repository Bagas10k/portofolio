<?php
// Simple configuration
// CHANGE THIS PASSWORD BEFORE DEPLOYING
define('ADMIN_PASSWORD', 'admin123'); 

// Paths
define('DATA_FILE', '../data/projects.json');
define('UPLOAD_DIR', '../assets/images/projects/');

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
?>
