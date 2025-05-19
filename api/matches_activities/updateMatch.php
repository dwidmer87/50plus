<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Nicht eingeloggt"]);
    exit;
}

require_once '../../system/config.php'; // Datenbankverbindung

// JSON aus der Anfrage lesen
$userId = $_SESSION['user_id'];
$input = json_decode(file_get_contents("php://input"), true);

// 1. Match-ID abholen

if (!isset($input['matchId'])) {
    http_response_code(400);
    echo json_encode(["error" => "Match-ID fehlt"]);
    exit;
}
$matchId = $input['matchId'];

// 2. Prüfen, ob User protector oder protected ist
$stmt = $pdo->prepare("SELECT id_protector, id_protected FROM matches_activities WHERE id = :matchId");
$stmt->bindParam(':matchId', $matchId);
$stmt->execute();
$match = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$match) {
    http_response_code(404);
    echo json_encode(["error" => "Match nicht gefunden"]);
    exit;
}

$isProtector = (int)$match['id_protector'] === (int)$userId;
$isProtected = (int)$match['id_protected'] === (int)$userId;


// 3. Antwort abholen
$answer = $input['answer'] ?? null;

// 4. Update von answer_protected oder answer_protector
if ($isProtected) {
    $column = "answer_protected";
} elseif ($isProtector) {
    $column = "answer_protector";
} else {
    http_response_code(403);
    echo json_encode(["error" => "Nicht berechtigt"]);
    exit;
}

$stmt = $pdo->prepare("UPDATE matches_activities SET $column = :answer WHERE id = :matchId");
$stmt->bindParam(':answer', $answer);
$stmt->bindParam(':matchId', $matchId);
$stmt->execute();

// 5. Je nach Kombination: Update status
$stmt = $pdo->prepare("SELECT answer_protected, answer_protector FROM matches_activities WHERE id = :matchId");
$stmt->bindParam(':matchId', $matchId);
$stmt->execute();
$answers = $stmt->fetch(PDO::FETCH_ASSOC);

if ($answers['answer_protected'] === "no" || $answers['answer_protector'] == "0") {
    $status = "dismissed";
} else if (
    $answers['answer_protected'] == null &&
    $answers['answer_protector'] == "1"
) {
    $status = "ready";
} else if (
    $answers['answer_protected'] !== null &&
    substr($answers['answer_protected'], -4) === "_yes" &&
    $answers['answer_protector'] == "1"
) {
    $status = "approved";
} else {
    $status = $answers['answer_protected'] !== null ? $answers['answer_protected'] : null;
}

$stmt = $pdo->prepare("UPDATE matches_activities SET status = :status WHERE id = :matchId");
$stmt->bindParam(':status', $status);
$stmt->bindParam(':matchId', $matchId);
$stmt->execute();

echo json_encode(["success" => true]);
