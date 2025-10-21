<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// KORREKTE PFADANGABEN:
require_once __DIR__ . '/../system/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../system/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../system/PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

try {
    // SMTP-Konfiguration
    $mail->isSMTP();
    $mail->Host       = 'mail.infomaniak.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'im4@dw-services.ch';
    $mail->Password   = 'IM4Te5tm@il';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Absender + Empfänger
    $mail->setFrom('im4@dw-services.ch', 'David Widmer');
    $mail->addAddress('d_widmer@outlook.com', 'David Widmer');

    // Inhalt
    $mail->isHTML(true);
    $mail->Subject = 'Testmail von PHPMailer';
    $mail->Body    = '<h3>Hallo!</h3><p>Dies ist eine Testmail, gesendet über <b>PHPMailer</b>.</p>';
    $mail->AltBody = 'Dies ist eine Testmail, gesendet über PHPMailer.';

    $mail->send();
    echo '✅ Mail wurde erfolgreich gesendet!';
} catch (Exception $e) {
    echo "❌ Mail konnte nicht gesendet werden. Fehler: {$mail->ErrorInfo}";
}
