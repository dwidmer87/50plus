<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Nicht eingeloggt"]);
    exit;
}

require_once '../../system/config.php'; // Datenbankverbindung

// JSON aus dem Request-Body lesen
$input = json_decode(file_get_contents("php://input"), true);

// Validierung
$required = ['date_time_start', 'date_time_end', 'place', 'destination', 'transport', 'compensation_accepted'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(["error" => "Fehlendes Feld: $field"]);
        exit;
    }
    // Für Strings zusätzlich leere Werte verhindern
    if (in_array($field, ['date_time_start', 'date_time_end', 'place', 'destination', 'transport']) && trim($input[$field]) === '') {
        http_response_code(400);
        echo json_encode(["error" => "Feld darf nicht leer sein: $field"]);
        exit;
    }
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO requests_offers (
            type,
            id_protected,
            date_time_start,
            date_time_end,
            place,
            destination,
            transport,
            status,
            compensation_accepted,
            created_at
        ) VALUES (
            'request',
            :id_protected,
            :date_time_start,
            :date_time_end,
            :place,
            :destination,
            :transport,
            'open',
            :compensation_accepted,
            NOW()
        )
    ");

    $stmt->execute([
        ':id_protected' => $_SESSION['user_id'],
        ':date_time_start' => $input['date_time_start'],
        ':date_time_end' => $input['date_time_end'],
        ':place' => $input['place'],
        ':destination' => $input['destination'],
        ':transport' => $input['transport'],
        ':compensation_accepted' => $input['compensation_accepted'] ? 1 : 0
    ]);

    echo json_encode(["success" => true, "message" => "Anfrage erfolgreich gespeichert."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Datenbankfehler: " . $e->getMessage()]);
}