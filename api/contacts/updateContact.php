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
    $stmt = $pdo->prepare("
        SELECT c.id, c.id_protected, u.first_name, u.last_name
        FROM contacts c
        JOIN user_profiles u ON c.id_protected = u.user_id
        WHERE c.verification_code = :code
          AND c.id_protector IS NULL
          AND c.created_at >= (NOW() - INTERVAL 48 HOUR)
    ");
    $stmt->execute([':code' => $verificationCode]);
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$contact) {
        echo json_encode(["success" => false, "error" => "Ungültiger oder bereits verwendeter Code"]);
        exit;
    }

    //____________________________________________________________
    // 2. Protector eintragen und validieren
    //____________________________________________________________
    $stmt = $pdo->prepare("
        UPDATE contacts
        SET id_protector = :protector, validated = 1
        WHERE verification_code = :code
          AND id_protector IS NULL
          AND created_at >= (NOW() - INTERVAL 48 HOUR)
    ");
    $stmt->execute([
        ':protector' => $userId,
        ':code' => $verificationCode
    ]);

    //____________________________________________________________
    // 3. Name der begleiteten Person zurückgeben
    //____________________________________________________________
    $fullName = trim($contact['first_name'] . ' ' . $contact['last_name']);
    echo json_encode([
        "success" => true,
        "protected_name" => $fullName
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal Server Error", "details" => $e->getMessage()]);
}
