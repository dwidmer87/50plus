<?php
session_start();
header('Content-Type: application/json');
require_once '../../system/config.php';

//__________________________________________________________
// 1️⃣ Eingang prüfen
//__________________________________________________________
$input = json_decode(file_get_contents('php://input'), true);
$token = isset($input['token']) ? trim($input['token']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';
$first_name = isset($input['first_name']) ? trim($input['first_name']) : '';
$last_name = isset($input['last_name']) ? trim($input['last_name']) : '';

if (empty($token)) {
    http_response_code(400);
    echo json_encode(["error" => "Fehlender Token"]);
    exit;
}

//__________________________________________________________
// 2️⃣ Token prüfen
//__________________________________________________________
$stmt = $pdo->prepare("
    SELECT * 
    FROM email_verifications
    WHERE token = :token AND used = 0 AND expires_at > NOW()
");
$stmt->execute([':token' => $token]);
$entry = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$entry) {
    http_response_code(400);
    echo json_encode(["error" => "Ungültiger oder abgelaufener Link"]);
    exit;
}

$email = $entry['email'];

//__________________________________________________________
// 3️⃣ Wenn Passwort vorhanden → Registrierung abschliessen
//__________________________________________________________
if (!empty($password)) {

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(["error" => "Das Passwort muss mindestens 8 Zeichen lang sein."]);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Prüfen, ob User schon existiert
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if ($user) {
        http_response_code(409);
        echo json_encode(["error" => "E-Mail bereits registriert"]);
        exit;
    }

    // User anlegen
    $stmt = $pdo->prepare("
        INSERT INTO users (email, password)
        VALUES (:email, :hash)
    ");
    $stmt->execute([
        ':email' => $email,
        ':hash' => $hash
    ]);

    $stmt = $pdo->prepare("
        INSERT INTO user_profiles (user_id, first_name, last_name)
        VALUES (LAST_INSERT_ID(), :first_name, :last_name)
    ");
   $stmt->execute([
       ':first_name' => $first_name,
       ':last_name' => $last_name
   ]);


    // Token als benutzt markieren
    $stmt = $pdo->prepare("UPDATE email_verifications SET used = 1 WHERE token = :token");
    $stmt->execute([':token' => $token]);

    echo json_encode(["success" => true, "message" => "Registrierung abgeschlossen."]);
    exit;
}

//__________________________________________________________
// 4️⃣ Wenn kein Passwort vorhanden → Token gültig, Passwortformular anzeigen
//__________________________________________________________
echo json_encode([
    "success" => true,
    "email" => $email,
    "message" => "Token gültig, bitte Passwort setzen."
]);
