<?php 
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Erfolgreich eingeloggt → Antwort zurückgeben
header('Content-Type: application/json');
echo json_encode([
    "success" => true,
    "user_id" => $_SESSION['user_id']
]);
