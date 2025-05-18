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

// Letzte Aktivitäten abfragen
$stmt = $pdo->prepare("
    SELECT ma.status, ma.id_protected, ma.id_protector, ro.date_time_start, ro.place
    FROM matches_activities ma
    JOIN requests_offers ro ON ma.id_request = ro.id
    WHERE (ma.id_protected = :userId OR ma.id_protector = :userId)
      AND ma.status IS NOT NULL
    ORDER BY ro.date_time_start DESC
");
$stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
$stmt->execute();
$allActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Hilfsfunktion: Namen holen
function getUserName($pdo, $userIdToLookup) {
    $stmt = $pdo->prepare("SELECT first_name, last_name FROM user_profiles WHERE user_id = :userId");
    $stmt->bindParam(':userId', $userIdToLookup, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        return $user['first_name'] . ' ' . $user['last_name'];
    }
    return 'Unbekannter Nutzer';
}

// IDs ersetzen
foreach ($allActivities as &$activity) {
    if ((int)$activity['id_protected'] === (int)$userId) {
        $activity['id_protected'] = 'actualUser';
    } else {
        $activity['id_protected'] = getUserName($pdo, $activity['id_protected']);
    }

    if ((int)$activity['id_protector'] === (int)$userId) {
        $activity['id_protector'] = 'actualUser';
    } else {
        $activity['id_protector'] = getUserName($pdo, $activity['id_protector']);
    }
}
unset($activity);

if (empty($allActivities)) {
    http_response_code(404);
    echo json_encode(["error" => "Keine Aktivitäten gefunden"]);
    exit;
}

$activity = array_slice($allActivities, 0, 4);
$activitiesRest = array_slice($allActivities, 4);

echo json_encode([
    "success" => true,
    "activity" => $activity,
    "activitiesRest" => $activitiesRest
]);
