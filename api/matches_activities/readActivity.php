<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

require_once '../../system/config.php';

// Letzte 4 Aktivitäten abfragen

$userId = $_SESSION['user_id'];

$stmt = $pdo->prepare("
    SELECT status
    FROM matches_activities 
    WHERE id_protected = :userId
      OR id_protector = :userId
");
$stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
$stmt->execute();
$allActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$allActivities || count($allActivities) === 0) {
    http_response_code(404);
    echo json_encode(["error" => "Aktivität nicht gefunden"]);
    exit;
}

$activity = array_slice($allActivities, 0, 4);
$activitiesRest = array_slice($allActivities, 4);

echo json_encode([
    "success" => true,
    "activity" => $activity,
    "activitiesRest" => $activitiesRest
]);
