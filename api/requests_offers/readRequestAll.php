<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Nicht eingeloggt"]);
    exit;
}

require_once '../../system/config.php';

try {
    $stmt = $pdo->prepare("
        SELECT 
            ro.id,
            ro.id_protected,
            ro.date_time_start,
            ro.date_time_end,
            ro.place,
            ro.destination,
            ro.transport,
            ro.compensation_accepted,
            up.first_name,
            up.last_name
        FROM requests_offers ro
        LEFT JOIN user_profiles up ON ro.id_protected = up.user_id
        INNER JOIN contacts c ON c.id_protected = ro.id_protected
        WHERE ro.type = 'request'
        AND c.id_protector = :user_id
        AND c.validated = 1
    ");

    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$requests) {
        http_response_code(404);
        echo json_encode(["error" => "No requests found"]);
        exit;
    }

    // Namen zusammenführen
    foreach ($requests as &$request) {
        $request["name"] = trim($request["first_name"] . " " . $request["last_name"]);
        unset($request["first_name"], $request["last_name"]); // optional: Rohdaten entfernen
    }

    echo json_encode([
        "success" => true,
        "requests" => $requests
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
