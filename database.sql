-- Base de données Educa-Psy
CREATE DATABASE educapsy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE educapsy;

-- Table utilisateurs (parents/tuteurs)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  adresse TEXT,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
  derniere_connexion TIMESTAMP NULL,
  INDEX idx_email (email)
);

-- Table enfants
CREATE TABLE enfants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  sexe ENUM('M', 'F', 'autre'),
  niveau_scolaire VARCHAR(50),
  ecole VARCHAR(200),
  photo_url VARCHAR(255),
  notes_specifiques TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table professionnels
CREATE TABLE professionnels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  specialite VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  telephone VARCHAR(20),
  photo_url VARCHAR(255),
  bio TEXT,
  actif BOOLEAN DEFAULT TRUE
);

-- Table rendez-vous
CREATE TABLE rendez_vous (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  enfant_id INT,
  professionnel_id INT NOT NULL,
  date_heure DATETIME NOT NULL,
  duree_minutes INT DEFAULT 60,
  type_consultation ENUM('soutien_scolaire', 'psychologie', 'orientation', 'autre'),
  statut ENUM('planifie', 'confirme', 'complete', 'annule') DEFAULT 'planifie',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE SET NULL,
  FOREIGN KEY (professionnel_id) REFERENCES professionnels(id),
  INDEX idx_date (date_heure),
  INDEX idx_statut (statut)
);

-- Table consultations (historique)
CREATE TABLE consultations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rendez_vous_id INT NOT NULL,
  compte_rendu TEXT,
  recommandations TEXT,
  progres_evaluation INT CHECK (progres_evaluation BETWEEN 0 AND 100),
  date_consultation DATETIME NOT NULL,
  duree_reelle_minutes INT,
  FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id) ON DELETE CASCADE
);

-- Table documents
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  enfant_id INT,
  titre VARCHAR(255) NOT NULL,
  type_document ENUM('rapport', 'bulletin', 'certificat', 'plan_intervention', 'autre'),
  fichier_url VARCHAR(255) NOT NULL,
  taille_ko INT,
  date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE
);

-- Table dons
CREATE TABLE dons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  montant DECIMAL(10, 2) NOT NULL,
  devise VARCHAR(3) DEFAULT 'HTG',
  type_don ENUM('unique', 'mensuel') DEFAULT 'unique',
  mode_paiement VARCHAR(50),
  affectation VARCHAR(100),
  anonyme BOOLEAN DEFAULT FALSE,
  statut ENUM('en_attente', 'complete', 'echoue', 'rembourse') DEFAULT 'en_attente',
  date_don TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_id VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (date_don),
  INDEX idx_statut (statut)
);

-- Table messages (chat/contact)
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  email VARCHAR(255),
  sujet VARCHAR(255),
  message TEXT NOT NULL,
  statut ENUM('nouveau', 'lu', 'repondu', 'archive') DEFAULT 'nouveau',
  date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reponse TEXT,
  date_reponse TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table newsletter
CREATE TABLE newsletter (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(100),
  actif BOOLEAN DEFAULT TRUE,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  derniere_campagne TIMESTAMP NULL
);

-- Table blog posts
CREATE TABLE blog_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  contenu TEXT NOT NULL,
  extrait TEXT,
  categorie VARCHAR(50),
  auteur_id INT,
  image_url VARCHAR(255),
  vues INT DEFAULT 0,
  publie BOOLEAN DEFAULT FALSE,
  date_publication TIMESTAMP,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (auteur_id) REFERENCES professionnels(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_categorie (categorie)
);

-- Table témoignages
CREATE TABLE temoignages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  nom_affiche VARCHAR(100),
  texte TEXT NOT NULL,
  note INT CHECK (note BETWEEN 1 AND 5),
  approuve BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table sessions (pour authentification)
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  data TEXT,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_expires (expires_at)
);

-- Vues utiles
CREATE VIEW vue_rendez_vous_complets AS
SELECT 
  rv.*,
  u.nom AS user_nom,
  u.prenom AS user_prenom,
  u.email AS user_email,
  e.nom AS enfant_nom,
  e.prenom AS enfant_prenom,
  p.nom AS pro_nom,
  p.prenom AS pro_prenom
FROM rendez_vous rv
LEFT JOIN users u ON rv.user_id = u.id
LEFT JOIN enfants e ON rv.enfant_id = e.id
LEFT JOIN professionnels p ON rv.professionnel_id = p.id;
