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

if (empty($token)) {
    http_response_code(400);
    echo json_encode(["error" => "Fehlender Token"]);
    exit;
}

//__________________________________________________________
// 2️⃣ Token prüfen + E-Mail über JOIN holen
//__________________________________________________________
$stmt = $pdo->prepare("
    SELECT pr.*, u.email
    FROM password_resets pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.token = :token 
      AND pr.used_at IS NULL 
      AND pr.expires_at > NOW()
");
$stmt->execute([':token' => $token]);
$entry = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$entry) {
    http_response_code(400);
    echo json_encode(["error" => "Ungültiger oder abgelaufener Link"]);
    exit;
}

$email = $entry['email'];
$user_id = $entry['user_id'];

//__________________________________________________________
// 3️⃣ Wenn Passwort vorhanden → Passwort zurücksetzen
//__________________________________________________________
if (!empty($password)) {

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(["error" => "Das Passwort muss mindestens 8 Zeichen lang sein."]);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Passwort updaten
    $stmt = $pdo->prepare("
        UPDATE users
        SET password = :hash
        WHERE id = :user_id
    ");
    $stmt->execute([
        ':hash' => $hash,
        ':user_id' => $user_id
    ]);

    // Token als benutzt markieren
    $stmt = $pdo->prepare("UPDATE password_resets SET used_at = NOW() WHERE token = :token");
    $stmt->execute([':token' => $token]);

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Passwort erfolgreich zurückgesetzt."]);
    exit;
}

//__________________________________________________________
// 4️⃣ Wenn kein Passwort vorhanden → Token gültig
//__________________________________________________________
http_response_code(200);
echo json_encode([
    "success" => true,
    "email" => $email,
    "message" => "Token gültig, bitte Passwort setzen."
]);
