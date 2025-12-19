<?php
/**
 * Database Migration: Update Social Media Fields
 * Replace dribbble with instagram and add tiktok
 */

require_once 'api/config.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Update Social Media Fields</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
        .success { color: #00ff00; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
        .error { color: #ff4444; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
        .info { color: #00aaff; padding: 10px; background: #2a2a2a; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔧 Database Migration: Update Social Media Fields</h1>
";

if (defined('DB_ERROR') && DB_ERROR) {
    echo "<div class='error'>❌ Database connection failed</div>";
    echo "</body></html>";
    exit;
}

echo "<div class='info'><h2>Step 1: Check Current Columns</h2>";
$columns = $conn->query("SHOW COLUMNS FROM profile");
$hasInstagram = false;
$hasTiktok = false;
$hasDribbble = false;

while ($col = $columns->fetch_assoc()) {
    if ($col['Field'] === 'instagram') $hasInstagram = true;
    if ($col['Field'] === 'tiktok') $hasTiktok = true;
    if ($col['Field'] === 'dribbble') $hasDribbble = true;
}

echo "<p>Dribbble column exists: " . ($hasDribbble ? "Yes" : "No") . "</p>";
echo "<p>Instagram column exists: " . ($hasInstagram ? "Yes" : "No") . "</p>";
echo "<p>TikTok column exists: " . ($hasTiktok ? "Yes" : "No") . "</p>";
echo "</div>";

// Step 2: Rename dribbble to instagram if it exists
if ($hasDribbble && !$hasInstagram) {
    echo "<div class='info'><h2>Step 2: Rename dribbble → instagram</h2>";
    if ($conn->query("ALTER TABLE profile CHANGE dribbble instagram VARCHAR(255) DEFAULT ''")) {
        echo "<p class='success'>✅ Renamed dribbble to instagram</p>";
    } else {
        echo "<p class='error'>❌ Error: " . $conn->error . "</p>";
    }
    echo "</div>";
} else if ($hasInstagram) {
    echo "<div class='success'><h2>Step 2: Instagram column already exists ✓</h2></div>";
}

// Step 3: Add tiktok column if it doesn't exist
if (!$hasTiktok) {
    echo "<div class='info'><h2>Step 3: Add TikTok column</h2>";
    if ($conn->query("ALTER TABLE profile ADD COLUMN tiktok VARCHAR(255) DEFAULT '' AFTER instagram")) {
        echo "<p class='success'>✅ Added tiktok column</p>";
    } else {
        echo "<p class='error'>❌ Error: " . $conn->error . "</p>";
    }
    echo "</div>";
} else {
    echo "<div class='success'><h2>Step 3: TikTok column already exists ✓</h2></div>";
}

// Step 4: Show final table structure
echo "<div class='info'><h2>Step 4: Final Table Structure</h2>";
$columns = $conn->query("SHOW COLUMNS FROM profile");
echo "<table border='1' cellpadding='5' style='border-collapse: collapse; color: #00ff00;'>";
echo "<tr style='background: #333;'><th>Field</th><th>Type</th><th>Default</th></tr>";
while ($col = $columns->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . $col['Field'] . "</td>";
    echo "<td>" . $col['Type'] . "</td>";
    echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
    echo "</tr>";
}
echo "</table>";
echo "</div>";

$conn->close();

echo "
    <div class='success'>
        <h2>✅ Migration Complete!</h2>
        <p><strong>Changes:</strong></p>
        <ul>
            <li>✅ Dribbble → Instagram</li>
            <li>✅ TikTok added</li>
        </ul>
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Go to Admin → Profile</li>
            <li>Fill in Instagram and TikTok URLs</li>
            <li>Save Changes</li>
        </ol>
    </div>
</body>
</html>";
?>
