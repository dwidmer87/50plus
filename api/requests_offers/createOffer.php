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
$required = ['date_time_start', 'date_time_end', 'place', 'transport', 'compensation_required'];

// Allgemeine Pflichtfelder prüfen
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(["error" => "Fehlendes Feld: $field"]);
        exit;
    }
    // Für Strings zusätzlich leere Werte verhindern
    if (in_array($field, ['date_time_start', 'date_time_end', 'place', 'transport']) && trim($input[$field]) === '') {
        http_response_code(400);
        echo json_encode(["error" => "Feld darf nicht leer sein: $field"]);
        exit;
    }
}

// Nur wenn kostenpflichtig: Beschreibung nötig
if ($input['compensation_required']) {
    if (empty($input['compensation_details'])) {
        http_response_code(400);
        echo json_encode(["error" => "Fehlendes Feld: compensation_details"]);
        exit;
    }
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO requests_offers (
            type,
            id_protector,
            date_time_start,
            date_time_end,
            place,
            transport,
            status,
            compensation_required,
            compensation_details,
            created_at
        ) VALUES (
            'offer',
            :id_protector,
            :date_time_start,
            :date_time_end,
            :place,
            :transport,
            'open',
            :compensation_required,
            :compensation_details,
            NOW()
        )
    ");

    $stmt->execute([
        ':id_protector' => $_SESSION['user_id'],
        ':date_time_start' => $input['date_time_start'],
        ':date_time_end' => $input['date_time_end'],
        ':place' => $input['place'],
        ':transport' => $input['transport'],
        ':compensation_required' => $input['compensation_required'] ? 1 : 0,
        ':compensation_details' => $input['compensation_details']
    ]);

    echo json_encode(["success" => true, "message" => "Angebot erfolgreich gespeichert."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Datenbankfehler: " . $e->getMessage()]);
}