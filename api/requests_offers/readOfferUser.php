<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Nicht eingeloggt"]);
    exit;
}

require_once '../../system/config.php'; // Datenbankverbindung

// JSON aus dem Offer-Body lesen
$input = json_decode(file_get_contents("php://input"), true);

$userId = $_SESSION['user_id'];

$stmt = $pdo->prepare("
    SELECT id_protector, date_time_start, date_time_end, transport, compensation_required
    FROM requests_offers
    WHERE id_protector = :id
");
$stmt->bindParam(':id', $userId, PDO::PARAM_INT);

try {
    $stmt->execute();
    $user = $stmt->fetchAll(PDO::FETCH_ASSOC);

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