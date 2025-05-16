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

// Hole Vor- und Nachnamen aus user_profiles + Email aus users
$stmt = $pdo->prepare("
    SELECT u.email, p.first_name, p.last_name
    FROM users u
    JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = :id
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
        "user" => $user
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}