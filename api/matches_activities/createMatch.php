<?php
$rawInput = file_get_contents("php://input");
file_put_contents("debug_input.json", $rawInput); // schreibt den Body in eine Datei

$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        "error" => "JSON-Body ungültig oder leer",
        "raw_input" => $rawInput,
        "json_last_error" => json_last_error(),
        "json_error_msg" => json_last_error_msg()
    ]);
    exit;
}

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
$required = ['id_protected', 'id_protector', 'id_request'];

foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(["error" => "Fehlendes Feld: $field"]);
        exit;
    }
    // Für Strings zusätzlich leere Werte verhindern
    if (in_array($field, ['id_protected', 'id_protector', 'id_request']) && trim($input[$field]) === '') {
        http_response_code(400);
        echo json_encode(["error" => "Feld darf nicht leer sein: $field"]);
        exit;
    }
}

error_log(print_r($input, true));

// Eintrag in die Datenbank einfügen

try {
    // Überprüfen, ob ein doppelter Eintrag existiert
    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) FROM matches_activities
        WHERE id_protected = :id_protected
        AND id_protector = :id_protector
        AND id_request = :id_request
    ");

    $checkStmt->execute([
        ':id_protected' => $input['id_protected'],
        ':id_protector' => $input['id_protector'],
        ':id_request' => $input['id_request']
    ]);

    $exists = $checkStmt->fetchColumn();

    if ($exists > 0) {
        http_response_code(409); // Konflikt
        echo json_encode(["error" => "Eintrag existiert bereits."]);
        exit;
    }

    // Eintrag in die Datenbank einfügen
    $stmt = $pdo->prepare("
        INSERT INTO matches_activities (
            id_protected,
            id_protector,
            id_request,
            created_at
        ) VALUES (
            :id_protected,
            :id_protector,
            :id_request,
            NOW()
        )
    ");

    $stmt->execute([
        ':id_protected' => $input['id_protected'],
        ':id_protector' => $input['id_protector'],
        ':id_request' => $input['id_request']
    ]);

    echo json_encode(["success" => true, "message" => "Anfrage erfolgreich gespeichert."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Datenbankfehler: " . $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}