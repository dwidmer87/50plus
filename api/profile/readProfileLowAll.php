<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

require_once '../../system/config.php';

// Hole Vor- und Nachnamen aus user_profiles
try{
    $stmt = $pdo->prepare("
    SELECT p.user_id, p.first_name, p.last_name
    FROM user_profiles p
");

$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$users) {
        http_response_code(404);
        echo json_encode(["error" => "No users found"]);
        exit;
    }

    // Namen zusammenführen
    foreach ($users as &$user) {
        $user["name"] = trim($user["first_name"] . " " . $user["last_name"]);
        unset($user["first_name"], $user["last_name"]); // optional: Rohdaten entfernen
    }

    echo json_encode([
        "success" => true,
        "users" => $users
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}