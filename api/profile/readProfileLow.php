<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

require_once '../../system/config.php';

$userId = $_SESSION['user_id'];

// Hole Vor- und Nachnamen aus user_profiles
$stmt = $pdo->prepare("
    SELECT p.first_name, p.last_name
    FROM user_profiles p
    WHERE p.user_id = :id
");
$stmt->bindParam(':id', $userId, PDO::PARAM_INT);

try {
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "first_name" => $user['first_name'],
        "last_name" => $user['last_name']
    ]);
} // Close try block
catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}