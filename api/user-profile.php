<?php
// Session starten
session_start();

// Überprüfen, ob der Benutzer eingeloggt ist
if (!isset($_SESSION['user_id'])) {
    // Falls der Benutzer nicht eingeloggt ist, zur Login-Seite umleiten
    header("Location: login.html");
    exit();
}

// DB-Verbindung herstellen
require_once '../system/config.php';

// Benutzer-ID aus der Session holen
$user_id = $_SESSION['user_id'];

// Daten des eingeloggten Benutzers aus der Tabelle 'user_profiles' abrufen
$stmt = $pdo->prepare("SELECT first_name, last_name FROM user_profiles WHERE user_id = :user_id");
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Überprüfen, ob der Benutzer in der Tabelle existiert
if ($user) {
    header ('Content-Type: application/json');
    echo json_encode([
        "status" => "success",
        "user" => $user
    ]);
}
else {
    http_response_code(404);
    header ('Content-Type: application/json');
    echo json_encode([
        "status" => "error",
        "message" => "Benutzer nicht gefunden."
    ]);
}
?>