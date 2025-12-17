<?php
// api/init_storage.php
// Run this once to ensure all storage files exist

function initStorage() {
    $dataDir = __DIR__ . '/../data';
    
    // Create data directory if missing
    if (!is_dir($dataDir)) {
        if (!mkdir($dataDir, 0777, true)) {
            return ['success' => false, 'message' => 'Could not create data directory'];
        }
        chmod($dataDir, 0777);
    }
    
    // Define all required files with their default content
    $files = [
        'projects.json' => [],
        'education.json' => [],
        'skills.json' => [],
        'messages.json' => [],
        'profile.json' => [
            'name' => 'Bagas',
            'role' => 'Programmer & UI/UX Designer',
            'tagline' => 'Crafting digital experiences where clean code meets modern aesthetics.',
            'about_text' => "I'm a passionate Programmer and UI/UX Designer based in Indonesia. My journey involves translating complex problems into simple, beautiful, and intuitive designs.",
            'years_exp' => '3+',
            'projects_count' => '20+',
            'email' => 'hello@bagas.dev',
            'avatar' => '',
            'socials' => [
                'linkedin' => '#',
                'github' => '#',
                'dribbble' => '#'
            ]
        ]
    ];
    
    $created = [];
    $errors = [];
    
    foreach ($files as $filename => $defaultContent) {
        $filepath = $dataDir . '/' . $filename;
        
        if (!file_exists($filepath)) {
            $json = json_encode($defaultContent, JSON_PRETTY_PRINT);
            if (file_put_contents($filepath, $json) !== false) {
                chmod($filepath, 0666);
                $created[] = $filename;
            } else {
                $errors[] = $filename;
            }
        }
    }
    
    return [
        'success' => empty($errors),
        'created' => $created,
        'errors' => $errors,
        'message' => empty($errors) ? 'Storage initialized successfully' : 'Some files could not be created'
    ];
}

// If called directly
if (basename($_SERVER['PHP_SELF']) === 'init_storage.php') {
    header('Content-Type: application/json');
    echo json_encode(initStorage());
}
?>
