<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

require_once '../../system/config.php';

// Anfrageparameter abholen
$input = json_decode(file_get_contents('php://input'), true);

$idProtected = $input['id_protected'] ?? null;
$idProtector = $input['id_protector'] ?? null;
$idRequest   = $input['id_request'] ?? null;

// Überprüfen, ob alle erforderlichen Parameter vorhanden sind

if (!$idProtected || !$idProtector || !$idRequest) {
    http_response_code(400);
    echo json_encode(["error" => "Fehlende Parameter"]);
    exit;
}

// Daten aus der Datenbank abfragen
$stmt = $pdo->prepare("
    SELECT id 
    FROM matches_activities 
    WHERE id_protected = :idProtected 
      AND id_protector = :idProtector 
      AND id_request = :idRequest
");
$stmt->bindParam(':idProtected', $idProtected);
$stmt->bindParam(':idProtector', $idProtector);
$stmt->bindParam(':idRequest', $idRequest);
$stmt->execute();
$match = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$match) {
    http_response_code(404);
    echo json_encode(["error" => "Match nicht gefunden"]);
    exit;
}

echo json_encode(["success" => true, "match_id" => $match['id']]);