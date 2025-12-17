<?php
require_once 'config.php';

if (file_exists(DATA_FILE)) {
    echo file_get_contents(DATA_FILE);
} else {
    echo json_encode([]);
}
?>
