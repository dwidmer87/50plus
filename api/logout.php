<?php
session_start();

// Sitzung beenden
$_SESSION = [];
session_destroy();

// Session-Cookie explizit löschen
setcookie(
    session_name(),      // meist "PHPSESSID"
    '',                  // Leeren
    time() - 42000,      // In die Vergangenheit setzen
    '/',                 // Gültig für gesamten Pfad
    'im4.dw-services.ch',// Fixierte Domain
    true,                // Secure (nur über HTTPS senden)
    true                 // HttpOnly (nicht im JS zugänglich)
);

// Browser-Cache verhindern
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');

// JSON-Antwort zurückgeben
header('Content-Type: application/json');
echo json_encode(["status" => "success"]);
exit;
