<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

require_once '../../system/config.php';

$userId = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

$fullName = trim($input['full_name'] ?? '');
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

// Validierung
if (!$fullName || !$email) {
    echo json_encode(["status" => "error", "message" => "Name und E-Mail dürfen nicht leer sein."]);
    exit;
}

// Vorname und Nachname aufteilen
$parts = explode(' ', $fullName, 2);
$firstName = $parts[0];
$lastName = $parts[1] ?? '';

// Transaktion (optional, aber empfehlenswert)
try {
    $pdo->beginTransaction();

    // Update user_profiles
    $stmtProfile = $pdo->prepare("UPDATE user_profiles SET first_name = :first, last_name = :last WHERE user_id = :id");
    $stmtProfile->execute([
        ':first' => $firstName,
        ':last' => $lastName,
        ':id' => $userId
    ]);

    // Update email
    $stmtEmail = $pdo->prepare("UPDATE users SET email = :email WHERE id = :id");
    $stmtEmail->execute([
        ':email' => $email,
        ':id' => $userId
    ]);

    // Optional: Passwort aktualisieren (nur wenn gesetzt)
    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmtPass = $pdo->prepare("UPDATE users SET password = :pass WHERE id = :id");
        $stmtPass->execute([
            ':pass' => $hashedPassword,
            ':id' => $userId
        ]);
    }

    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "Profil erfolgreich aktualisiert."]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Fehler bei der Aktualisierung: " . $e->getMessage()]);
}
