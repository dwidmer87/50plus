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
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['verification_code'])) {
    http_response_code(400);
    echo json_encode(["error" => "Verification code missing"]);
    exit;
}

$verificationCode = $input['verification_code'];

try {
    //____________________________________________________________
    // 1. Prüfen, ob Code existiert, gültig und noch ungenutzt ist
    //____________________________________________________________
    $stmt = $pdo->prepare("SELECT id FROM contacts 
    WHERE verification_code = :code
    AND id_protector IS NULL
    AND created_at >= (NOW() - INTERVAL 48 HOUR)");
    $stmt->execute([':code' => $verificationCode]);
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$contact) {
        echo json_encode(["success" => false, "error" => "Ungültiger oder bereits verwendeter Code"]);
        exit;
    }

    //____________________________________________________________
    // 2. Protector eintragen und validieren
    //____________________________________________________________
    $stmt = $pdo->prepare("UPDATE contacts SET id_protector = :protector, validated = 1
    WHERE verification_code = :code
    AND id_protector IS NULL
    AND created_at >= (NOW() - INTERVAL 48 HOUR)");
    $stmt->execute([
        ':protector' => $userId,
        ':code' => $verificationCode
    ]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal Server Error", "details" => $e->getMessage()]);
}
