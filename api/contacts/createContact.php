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

try {
    $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO contacts (id_protected, verification_code)
        VALUES (:id_protected, :verification_code)
    ");
    $stmt->execute([
        ':id_protected' => $userId,
        ':verification_code' => $verificationCode
    ]);

    echo json_encode([
        "success" => true,
        "user" => [
            "verification_code" => $verificationCode
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal Server Error"]);
}
