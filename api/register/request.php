<?php
session_start();
header('Content-Type: application/json');

// CORS / Cache (optional, falls nötig)
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

require_once '../../system/config.php'; // enthält $pdo, Mail-Konfig etc.

//__________________________________________________________
// 1️⃣ Eingangsdaten prüfen
//__________________________________________________________

$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Ungültige E-Mail-Adresse"]);
    exit;
}

//__________________________________________________________
// 2️⃣ Rate Limit: nicht zu oft versenden
//__________________________________________________________
$stmt = $pdo->prepare("
    SELECT created_at 
    FROM email_verifications 
    WHERE email = :email 
    ORDER BY created_at DESC 
    LIMIT 1
");
$stmt->execute([':email' => $email]);
$last = $stmt->fetch(PDO::FETCH_ASSOC);

if ($last && strtotime($last['created_at']) > strtotime('-5 minutes')) {
    http_response_code(429);
    echo json_encode(["error" => "Bitte warten Sie ein paar Minuten, bevor Sie es erneut versuchen."]);
    exit;
}

//__________________________________________________________
// 3️⃣ Token generieren + speichern
//__________________________________________________________

$token = bin2hex(random_bytes(32)); // sicherer 64-stelliger Token
$expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

$stmt = $pdo->prepare("
    INSERT INTO email_verifications (email, token, expires_at, ip_address, user_agent)
    VALUES (:email, :token, :expires_at, :ip, :ua)
");
$stmt->execute([
    ':email' => $email,
    ':token' => $token,
    ':expires_at' => $expires,
    ':ip' => $_SERVER['REMOTE_ADDR'] ?? null,
    ':ua' => $_SERVER['HTTP_USER_AGENT'] ?? null
]);

//__________________________________________________________
// 4️⃣ E-Mail mit Bestätigungslink versenden
//__________________________________________________________

require_once '../../system/PHPMailer/src/PHPMailer.php';
require_once '../../system/PHPMailer/src/SMTP.php';
require_once '../../system/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$verifyUrl = "https://im4.dw-services.ch/register/confirm.html?token=" . urlencode($token);

// 🔹 HTML-Template laden
$templatePath = __DIR__ . '/templates/registration-mail.html';
if (!file_exists($templatePath)) {
    http_response_code(500);
    echo json_encode(["error" => "E-Mail-Template nicht gefunden"]);
    exit;
}

$htmlBody = file_get_contents($templatePath);
$htmlBody = str_replace('{{VERIFICATION_LINK}}', htmlspecialchars($verifyUrl, ENT_QUOTES, 'UTF-8'), $htmlBody);

// 🔹 Fallback Textversion
$plainText = "Hallo!\n\n"
    . "Bitte bestätigen Sie Ihre Registrierung, indem Sie auf den folgenden Link klicken:\n"
    . "$verifyUrl\n\n"
    . "Dieser Link ist 24 Stunden gültig.\n\n"
    . "Freundliche Grüsse\nIhr 50plus-Team";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'mail.infomaniak.com';
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USER;
    $mail->Password = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';

    $mail->setFrom('im4@dw-services.ch', 'Sicher-Hei+ - Vertraut begleitet');
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Bestätigung Ihrer Registrierung bei Sicher-Hei+';
    $mail->Body = $htmlBody;
    $mail->AltBody = $plainText;

    $mail->send();

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Mail error: " . $mail->ErrorInfo]);
}
