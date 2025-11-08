<?php
session_start();
header('Content-Type: application/json');

require_once '../../system/config.php';

// Lese Trash-Mail-Domains aus der Datenbank
$stmt = $pdo->prepare("
    SELECT trashdomain
    FROM trashmail_domains
");
try {
    $stmt->execute();
    $domains = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "success" => true,
        "trashmail_domains" => $domains
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}