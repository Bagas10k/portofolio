<?php
// setup.php
// Run this file in your browser: e.g. http://yourwebsite.com/setup.php

echo "<h1>Website Setup & Check</h1>";
echo "<pre>";

$directories = [
    'data',
    'assets/images/projects'
];

$files = [
    'data/projects.json' => '[]',
    'data/skills.json' => '[]',
    'data/messages.json' => '[]',
    'data/profile.json' => '{}'
];

// 1. Create Directories
foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        if (mkdir($dir, 0777, true)) {
            echo "[OK] Directory created: $dir\n";
        } else {
            echo "[ERROR] Failed to create directory: $dir (Check parent permissions)\n";
        }
    } else {
        echo "[OK] Directory exists: $dir\n";
    }

    // Attempt Permissions
    if (chmod($dir, 0777)) {
        echo "[OK] Permissions set to 777 for: $dir\n";
    } else {
        echo "[WARNING] Could not strict chmod $dir (Might need checking manually)\n";
    }
}

// 2. Create and Init Files
foreach ($files as $file => $content) {
    if (!file_exists($file)) {
        if (file_put_contents($file, $content) !== false) {
            echo "[OK] File created: $file\n";
        } else {
            echo "[ERROR] Failed to create file: $file\n";
        }
    } else {
        echo "[OK] File exists: $file\n";
    }

    if (chmod($file, 0666)) {
        echo "[OK] Permissions set to 666 for: $file\n";
    } else {
        echo "[WARNING] Could not chmod $file\n";
    }
}

echo "\n---------------------------------------------------\n";
echo "Attempting to verify PHP Write Access...\n";

$testFile = 'data/test_write.txt';
if (file_put_contents($testFile, 'test') !== false) {
    echo "[PASSED] PHP can write to 'data' folder.\n";
    unlink($testFile);
} else {
    echo "[FAILED] PHP cannot write to 'data' folder. Please chmod 777 folder 'data' via your Hosting File Manager.\n";
}

echo "</pre>";
echo "<p>If you see [OK] or [PASSED], you can delete this file (setup.php) and start using your admin panel.</p>";
echo "<a href='admin/index.html'>Go to Admin Login</a>";
?>
