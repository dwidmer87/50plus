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
            ro.id_protector,
            ro.date_time_start,
            ro.date_time_end,
            ro.place,
            ro.transport,
            ro.compensation_required,
            ro.compensation_details,
            up.first_name,
            up.last_name
        FROM requests_offers ro
        LEFT JOIN user_profiles up ON ro.id_protector = up.user_id
        INNER JOIN contacts c ON c.id_protector = ro.id_protector
        WHERE ro.type = 'offer'
        AND c.id_protected = :user_id
        AND c.validated = 1
    ");

    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$offers) {
        http_response_code(404);
        echo json_encode(["error" => "No offers found"]);
        exit;
    }

    // Namen zusammenführen
    foreach ($offers as &$offer) {
        $offer["name"] = trim($offer["first_name"] . " " . $offer["last_name"]);
        unset($offer["first_name"], $offer["last_name"]); // optional: Rohdaten entfernen
    }

    echo json_encode([
        "success" => true,
        "offers" => $offers
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
