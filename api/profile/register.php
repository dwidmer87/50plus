<?php
session_start();
header('Content-Type: application/json');

require_once '../../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // JSON-Daten einlesen
    $data = json_decode(file_get_contents("php://input"), true);

    $first_name = trim($data['first_name'] ?? '');
    $last_name  = trim($data['last_name'] ?? '');
    $email      = trim($data['email'] ?? '');
    $password   = trim($data['password'] ?? '');

    if (!$email || !$password || !$first_name || !$last_name) {
        echo json_encode(["status" => "error", "message" => "Email, password, first name, and last name are required"]);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user into users table
    $insertUser = $pdo->prepare("INSERT INTO users (email, password) VALUES (:email, :pass)");
    $insertUser->execute([
        ':email' => $email,
        ':pass'  => $hashedPassword
    ]);

    // Insert the profile into user_profiles table
    $insertProfile = $pdo->prepare("INSERT INTO user_profiles (user_id, first_name, last_name) VALUES (LAST_INSERT_ID(), :first_name, :last_name)");
    $insertProfile->execute([
        ':first_name' => $first_name,
        ':last_name'  => $last_name
    ]);

    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
