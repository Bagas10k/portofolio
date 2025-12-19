<?php
// Database Setup Script
// Run this file once to create all necessary database tables

require_once 'config.php';

if (defined('DB_ERROR') && DB_ERROR) {
    die("Database connection failed! Please check your config.php settings.");
}

echo "<h1>Database Setup</h1>";
echo "<pre>";

// Create Profile Table
$sql_profile = "CREATE TABLE IF NOT EXISTS profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) DEFAULT '',
    role VARCHAR(255) DEFAULT '',
    tagline VARCHAR(255) DEFAULT '',
    about_text TEXT DEFAULT '',
    avatar VARCHAR(500) DEFAULT '',
    years_exp VARCHAR(50) DEFAULT '',
    projects_count VARCHAR(50) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    linkedin VARCHAR(500) DEFAULT '',
    github VARCHAR(500) DEFAULT '',
    instagram VARCHAR(500) DEFAULT '',
    tiktok VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql_profile) === TRUE) {
    echo "[OK] Table 'profile' created or already exists\n";
    
    // Check if profile record exists
    $result = $conn->query("SELECT COUNT(*) as count FROM profile");
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        // Insert default profile record
        $insert_profile = "INSERT INTO profile (id, name, role, tagline, about_text, email) 
                          VALUES (1, 'Your Name', 'Your Role', 'Your Tagline', 'About yourself...', 'your@email.com')";
        if ($conn->query($insert_profile) === TRUE) {
            echo "[OK] Default profile record inserted (ID: 1)\n";
        } else {
            echo "[ERROR] Failed to insert default profile: " . $conn->error . "\n";
        }
    } else {
        echo "[OK] Profile record already exists\n";
    }
} else {
    echo "[ERROR] Failed to create 'profile' table: " . $conn->error . "\n";
}

// Create Projects Table
$sql_projects = "CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    category VARCHAR(100),
    tech_stack VARCHAR(500),
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql_projects) === TRUE) {
    echo "[OK] Table 'projects' created or already exists\n";
} else {
    echo "[ERROR] Failed to create 'projects' table: " . $conn->error . "\n";
}

// Create Skills Table
$sql_skills = "CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    level INT DEFAULT 50,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql_skills) === TRUE) {
    echo "[OK] Table 'skills' created or already exists\n";
} else {
    echo "[ERROR] Failed to create 'skills' table: " . $conn->error . "\n";
}

// Create Education Table
$sql_education = "CREATE TABLE IF NOT EXISTS education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    year VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql_education) === TRUE) {
    echo "[OK] Table 'education' created or already exists\n";
} else {
    echo "[ERROR] Failed to create 'education' table: " . $conn->error . "\n";
}

// Create Messages Table
$sql_messages = "CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql_messages) === TRUE) {
    echo "[OK] Table 'messages' created or already exists\n";
} else {
    echo "[ERROR] Failed to create 'messages' table: " . $conn->error . "\n";
}

// Create Gallery Table (for avatar selection)
$sql_gallery = "CREATE TABLE IF NOT EXISTS gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    filesize INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql_gallery) === TRUE) {
    echo "[OK] Table 'gallery' created or already exists\n";
} else {
    echo "[ERROR] Failed to create 'gallery' table: " . $conn->error . "\n";
}

echo "\n---------------------------------------------------\n";
echo "Database setup completed!\n";
echo "You can now safely delete this file (setup_database.php)\n";
echo "</pre>";
echo "<a href='../admin/index.html'>Go to Admin Login</a>";

$conn->close();
?>
