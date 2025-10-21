<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Nicht eingeloggt"]);
    exit;
}

require_once '../../system/config.php';

try {
    // Erste Abfrage: Protectors (Personen, die mich begleiten)
    $stmt = $pdo->prepare("
        SELECT 
            c.id_protector,
            up.first_name,
            up.last_name
        FROM contacts c
        LEFT JOIN user_profiles up ON up.user_id = c.id_protector
        WHERE c.id_protected = :user_id AND c.validated = 1
    ");
    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $protector_contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Namen zusammenführen
    foreach ($protector_contacts as &$protector_contact) {
        $protector_contact["name"] = trim($protector_contact["first_name"] . " " . $protector_contact["last_name"]);
        unset($protector_contact["first_name"], $protector_contact["last_name"]);
    }

    // Zweite Abfrage: Protected (Personen, die ich begleite)
    $stmt = $pdo->prepare("
        SELECT 
            c.id_protected,
            up.first_name,
            up.last_name
        FROM contacts c
        LEFT JOIN user_profiles up ON up.user_id = c.id_protected
        WHERE c.id_protector = :user_id AND c.validated = 1
    ");
    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $protected_contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Namen zusammenführen
    foreach ($protected_contacts as &$protected_contact) {
        $protected_contact["name"] = trim($protected_contact["first_name"] . " " . $protected_contact["last_name"]);
        unset($protected_contact["first_name"], $protected_contact["last_name"]);
    }

    echo json_encode([
        "success" => true,
        "protector_contacts" => $protector_contacts,
        "protected_contacts" => $protected_contacts
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}