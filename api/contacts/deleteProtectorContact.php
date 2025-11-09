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

    $input = json_decode(file_get_contents('php://input'), true);
    $contactId = $input['contact_id'] ?? null;

    if (!$contactId) {
        http_response_code(400);
        echo json_encode(["error" => "Bad Request: Missing contact_id"]);
        exit;
    }
    
    $stmt = $pdo->prepare("
        DELETE FROM contacts 
        WHERE id_protector = :id_protector AND id_protected = :id_protected
    ");
    $stmt->execute([
        ':id_protector' => $contactId,
        ':id_protected' => $userId
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Kein Kontakt gefunden oder keine Berechtigung"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal Server Error"]);
}
