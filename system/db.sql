-- db.sql
-- Create the database and the users table

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`email`)
);

CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY (`user_id`)
);

CREATE TABLE IF NOT EXISTS `requests_offers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` ENUM('request', 'offer') NOT NULL,
  `id_protected` INT DEFAULT NULL,
  `date_time_start` DATETIME NOT NULL,
  `date_time_end` DATETIME NOT NULL,
  `place` VARCHAR(255) DEFAULT NULL,
  `destination` VARCHAR(255) DEFAULT NULL,
  `transport` VARCHAR (100) DEFAULT NULL,
  `id_protector` INT DEFAULT NULL,
  `compensation_accepted` TINYINT(1) DEFAULT 0,
  `compensation_required` TINYINT(1) DEFAULT 0,
  `compensation_details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_protected`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (`id_protector`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
);

CREATE TABLE IF NOT EXISTS `matches_activities`(
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_protected` INT NOT NULL,
  `id_protector` INT NOT NULL,
  `id_request` INT NOT NULL,
  `answer_protected` VARCHAR(50) DEFAULT NULL,
  `answer_protector` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_protected`) REFERENCES `user_profiles`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (`id_protector`) REFERENCES `user_profiles`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (`id_request`) REFERENCES `requests_offers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_protector` INT DEFAULT NULL,
  `id_protected` INT DEFAULT NULL,
  `verification_code` CHAR(6) DEFAULT NULL,
  `validated` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_protector`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_protected`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);