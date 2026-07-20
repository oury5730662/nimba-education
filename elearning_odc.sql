-- ================================================================
-- ODC-GUINÉE — PROJET FULLSTACK
-- Plateforme e-learning : Formation en ligne
-- Base de données complète — MariaDB
-- Chef de projet : DIALLO Mamadou Oury
-- Groupe : Oury, Mariame Diakité, Mamadou Alpha Diallo
-- ================================================================

CREATE DATABASE IF NOT EXISTS elearning_odc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE elearning_odc;

-- ================================================================
-- SCHÉMA GLOBAL DES RELATIONS
-- ================================================================
--
--  utilisateurs ──┬──► inscriptions ──► cours ──► ressources
--                 │                      │
--                 │                      └──► quiz ──► questions ──► reponses
--                 │
--                 ├──► progression (liée à cours + utilisateurs)
--                 │
--                 └──► certificats (liée à cours + utilisateurs)
--
--  formateurs ────────► cours
--  categories ─────────► cours
--
-- ================================================================


-- ================================================================
-- ╔══════════════════════════════════════════════════════════════╗
-- ║  TABLES DE BASE (sans dépendances)                          ║
-- ╚══════════════════════════════════════════════════════════════╝
-- ================================================================


-- ---------------------------------------------------------------
-- TABLE : utilisateurs
-- Contient tous les utilisateurs (apprenants ET formateurs)
-- Partagée par TOUT le groupe
-- ---------------------------------------------------------------
CREATE TABLE utilisateurs (
    id_utilisateur  INT             NOT NULL AUTO_INCREMENT,
    nom             VARCHAR(100)    NOT NULL,
    prenom          VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    mot_de_passe    VARCHAR(255)    NOT NULL,  -- hashé avec BCrypt
    role            ENUM('apprenant','formateur','admin') NOT NULL DEFAULT 'apprenant',
    photo_profil    VARCHAR(255),
    bio             TEXT,
    date_inscription DATETIME       DEFAULT CURRENT_TIMESTAMP,
    est_actif       BOOLEAN         DEFAULT TRUE,
    token_reset     VARCHAR(255),   -- pour réinitialisation mot de passe

    CONSTRAINT pk_utilisateur PRIMARY KEY (id_utilisateur)
);


-- ---------------------------------------------------------------
-- TABLE : categories
-- Catégories des cours (ex: Développement Web, Design, etc.)
-- ═══ PARTIE : OURY ═══
-- ---------------------------------------------------------------
CREATE TABLE categories (
    id_categorie    INT             NOT NULL AUTO_INCREMENT,
    nom             VARCHAR(100)    NOT NULL UNIQUE,
    description     TEXT,
    icone           VARCHAR(100),   -- nom de l'icône ou URL
    couleur         VARCHAR(7),     -- code HEX ex: #FF5733
    date_creation   DATETIME        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_categorie PRIMARY KEY (id_categorie)
);


-- ================================================================
-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FONCTIONNALITÉ 1 & 2 : CRÉATION DE COURS + RESSOURCES      ║
-- ║  RESPONSABLE : DIALLO Mamadou Oury                          ║
-- ╚══════════════════════════════════════════════════════════════╝
-- ================================================================


-- ---------------------------------------------------------------
-- TABLE : cours
-- Table principale de la plateforme
-- ═══ PARTIE : OURY ═══
-- ---------------------------------------------------------------
CREATE TABLE cours (
    id_cours        INT             NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(200)    NOT NULL,
    description     TEXT,
    contenu         LONGTEXT,       -- contenu HTML/Markdown du cours
    image_couverture VARCHAR(255),  -- URL de l'image de couverture
    niveau          ENUM('debutant','intermediaire','avance') DEFAULT 'debutant',
    duree_estimee   INT,            -- durée en minutes
    prix            DECIMAL(10,2)   DEFAULT 0.00,  -- 0 = gratuit
    est_publie      BOOLEAN         DEFAULT FALSE,
    est_certifiant  BOOLEAN         DEFAULT FALSE,
    nb_vues         INT             DEFAULT 0,
    note_moyenne    DECIMAL(3,2)    DEFAULT 0.00,
    date_creation   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Clés étrangères
    id_formateur    INT             NOT NULL,   -- → utilisateurs (formateur)
    id_categorie    INT,                        -- → categories

    CONSTRAINT pk_cours PRIMARY KEY (id_cours),

    CONSTRAINT fk_cours_formateur
        FOREIGN KEY (id_formateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_cours_categorie
        FOREIGN KEY (id_categorie)
        REFERENCES categories(id_categorie)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : sections_cours
-- Un cours est divisé en sections (chapitres)
-- ═══ PARTIE : OURY ═══
-- ---------------------------------------------------------------
CREATE TABLE sections_cours (
    id_section      INT             NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(200)    NOT NULL,
    description     TEXT,
    ordre           INT             NOT NULL DEFAULT 1,  -- ordre d'affichage
    id_cours        INT             NOT NULL,  -- → cours

    CONSTRAINT pk_section PRIMARY KEY (id_section),

    CONSTRAINT fk_section_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : ressources
-- Vidéos, PDF, liens, images liés à une section de cours
-- ═══ PARTIE : OURY ═══
-- ---------------------------------------------------------------
CREATE TABLE ressources (
    id_ressource    INT             NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(200)    NOT NULL,
    description     TEXT,
    type_ressource  ENUM('video','pdf','lien','image','document') NOT NULL,
    url             VARCHAR(500)    NOT NULL,   -- URL du fichier ou lien externe
    nom_fichier     VARCHAR(255),               -- nom original du fichier uploadé
    taille_fichier  BIGINT,                     -- taille en octets
    duree           INT,                        -- durée en secondes (pour vidéos)
    est_gratuit     BOOLEAN         DEFAULT FALSE,  -- aperçu gratuit ?
    ordre           INT             NOT NULL DEFAULT 1,
    nb_telechargements INT          DEFAULT 0,
    date_ajout      DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Clés étrangères
    id_section      INT             NOT NULL,   -- → sections_cours
    id_cours        INT             NOT NULL,   -- → cours (redondant mais pratique)

    CONSTRAINT pk_ressource PRIMARY KEY (id_ressource),

    CONSTRAINT fk_ressource_section
        FOREIGN KEY (id_section)
        REFERENCES sections_cours(id_section)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_ressource_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : commentaires_cours
-- Commentaires et avis sur les cours
-- ═══ PARTIE : OURY ═══
-- ---------------------------------------------------------------
CREATE TABLE commentaires_cours (
    id_commentaire  INT             NOT NULL AUTO_INCREMENT,
    contenu         TEXT            NOT NULL,
    note            INT             CHECK (note BETWEEN 1 AND 5),  -- 1 à 5 étoiles
    date_creation   DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Clés étrangères
    id_utilisateur  INT             NOT NULL,
    id_cours        INT             NOT NULL,

    CONSTRAINT pk_commentaire PRIMARY KEY (id_commentaire),

    CONSTRAINT fk_comm_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_comm_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ================================================================
-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FONCTIONNALITÉ 3 & 4 : QUIZ + SUIVI DE PROGRESSION         ║
-- ║  RESPONSABLE : DIAKITÉ Mariame                              ║
-- ╚══════════════════════════════════════════════════════════════╝
-- ================================================================


-- ---------------------------------------------------------------
-- TABLE : inscriptions_cours
-- Un apprenant s'inscrit à un cours
-- ═══ PARTIE : MARIAME ═══
-- ---------------------------------------------------------------
CREATE TABLE inscriptions_cours (
    id_inscription  INT             NOT NULL AUTO_INCREMENT,
    date_inscription DATETIME       DEFAULT CURRENT_TIMESTAMP,
    statut          ENUM('en_cours','termine','abandonne') DEFAULT 'en_cours',
    prix_paye       DECIMAL(10,2)   DEFAULT 0.00,

    -- Clés étrangères
    id_utilisateur  INT             NOT NULL,
    id_cours        INT             NOT NULL,

    -- Un utilisateur ne peut s'inscrire qu'une fois par cours
    CONSTRAINT uq_inscription UNIQUE (id_utilisateur, id_cours),

    CONSTRAINT pk_inscription PRIMARY KEY (id_inscription),

    CONSTRAINT fk_insc_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_insc_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : quiz
-- Quiz associés à un cours ou une section
-- ═══ PARTIE : MARIAME ═══
-- ---------------------------------------------------------------
CREATE TABLE quiz (
    id_quiz         INT             NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(200)    NOT NULL,
    description     TEXT,
    duree_limite    INT,            -- durée en minutes (NULL = pas de limite)
    note_passage    DECIMAL(5,2)    DEFAULT 50.00,  -- % minimum pour réussir
    nb_tentatives   INT             DEFAULT 3,       -- tentatives autorisées
    est_actif       BOOLEAN         DEFAULT TRUE,
    date_creation   DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Clés étrangères
    id_cours        INT             NOT NULL,
    id_section      INT,            -- quiz lié à une section précise (optionnel)

    CONSTRAINT pk_quiz PRIMARY KEY (id_quiz),

    CONSTRAINT fk_quiz_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_quiz_section
        FOREIGN KEY (id_section)
        REFERENCES sections_cours(id_section)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : questions
-- Questions d'un quiz
-- ═══ PARTIE : MARIAME ═══
-- ---------------------------------------------------------------
CREATE TABLE questions (
    id_question     INT             NOT NULL AUTO_INCREMENT,
    enonce          TEXT            NOT NULL,
    type_question   ENUM('choix_unique','choix_multiple','vrai_faux','texte_libre') NOT NULL,
    points          DECIMAL(5,2)    DEFAULT 1.00,
    explication     TEXT,           -- explication de la bonne réponse
    ordre           INT             DEFAULT 1,
    image_url       VARCHAR(255),   -- image optionnelle dans la question

    -- Clé étrangère
    id_quiz         INT             NOT NULL,

    CONSTRAINT pk_question PRIMARY KEY (id_question),

    CONSTRAINT fk_question_quiz
        FOREIGN KEY (id_quiz)
        REFERENCES quiz(id_quiz)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : reponses
-- Réponses possibles pour chaque question
-- ═══ PARTIE : MARIAME ═══
-- ---------------------------------------------------------------
CREATE TABLE reponses (
    id_reponse      INT             NOT NULL AUTO_INCREMENT,
    contenu         TEXT            NOT NULL,
    est_correcte    BOOLEAN         DEFAULT FALSE,
    ordre           INT             DEFAULT 1,

    -- Clé étrangère
    id_question     INT             NOT NULL,

    CONSTRAINT pk_reponse PRIMARY KEY (id_reponse),

    CONSTRAINT fk_reponse_question
        FOREIGN KEY (id_question)
        REFERENCES questions(id_question)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : tentatives_quiz
-- Enregistre chaque tentative d'un apprenant à un quiz
-- ═══ PARTIE : MARIAME ═══
-- ---------------------------------------------------------------
CREATE TABLE tentatives_quiz (
    id_tentative    INT             NOT NULL AUTO_INCREMENT,
    score_obtenu    DECIMAL(5,2),   -- score en pourcentage
    est_reussi      BOOLEAN         DEFAULT FALSE,
    date_debut      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    date_fin        DATETIME,
    temps_passe     INT,            -- temps en secondes

    -- Clés étrangères
    id_utilisateur  INT             NOT NULL,
    id_quiz         INT             NOT NULL,

    CONSTRAINT pk_tentative PRIMARY KEY (id_tentative),

    CONSTRAINT fk_tentative_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_tentative_quiz
        FOREIGN KEY (id_quiz)
        REFERENCES quiz(id_quiz)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : reponses_apprenant
-- Réponses données par un apprenant lors d'une tentative
-- ═══ PARTIE : MARIAME ═══
-- ---------------------------------------------------------------
CREATE TABLE reponses_apprenant (
    id              INT             NOT NULL AUTO_INCREMENT,
    reponse_texte   TEXT,           -- pour les questions à texte libre

    -- Clés étrangères
    id_tentative    INT             NOT NULL,
    id_question     INT             NOT NULL,
    id_reponse      INT,            -- NULL si texte libre

    CONSTRAINT pk_reponse_apprenant PRIMARY KEY (id),

    CONSTRAINT fk_rep_app_tentative
        FOREIGN KEY (id_tentative)
        REFERENCES tentatives_quiz(id_tentative)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_rep_app_question
        FOREIGN KEY (id_question)
        REFERENCES questions(id_question)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_rep_app_reponse
        FOREIGN KEY (id_reponse)
        REFERENCES reponses(id_reponse)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : progression
-- Suivi de la progression d'un apprenant sur les ressources
-- ═══ PARTIE : MARIAME ═══
-- ---------------------------------------------------------------
CREATE TABLE progression (
    id_progression  INT             NOT NULL AUTO_INCREMENT,
    est_complete    BOOLEAN         DEFAULT FALSE,
    pourcentage     DECIMAL(5,2)    DEFAULT 0.00,  -- 0 à 100
    temps_passe     INT             DEFAULT 0,      -- secondes passées sur la ressource
    derniere_position INT           DEFAULT 0,      -- position en secondes (pour vidéos)
    date_debut      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    date_completion DATETIME,

    -- Clés étrangères
    id_utilisateur  INT             NOT NULL,
    id_ressource    INT             NOT NULL,
    id_cours        INT             NOT NULL,

    -- Un utilisateur a une seule progression par ressource
    CONSTRAINT uq_progression UNIQUE (id_utilisateur, id_ressource),

    CONSTRAINT pk_progression PRIMARY KEY (id_progression),

    CONSTRAINT fk_prog_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_prog_ressource
        FOREIGN KEY (id_ressource)
        REFERENCES ressources(id_ressource)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_prog_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ================================================================
-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FONCTIONNALITÉ 5 & 6 : CERTIFICATS + ESPACE FORMATEUR      ║
-- ║  RESPONSABLE : DIALLO Mamadou Alpha                         ║
-- ╚══════════════════════════════════════════════════════════════╝
-- ================================================================


-- ---------------------------------------------------------------
-- TABLE : certificats
-- Certificats délivrés aux apprenants ayant terminé un cours
-- ═══ PARTIE : ALPHA ═══
-- ---------------------------------------------------------------
CREATE TABLE certificats (
    id_certificat   INT             NOT NULL AUTO_INCREMENT,
    numero_certificat VARCHAR(50)   NOT NULL UNIQUE,  -- ex: ODC-2024-00001
    date_emission   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    date_expiration DATE,           -- NULL = pas d'expiration
    url_pdf         VARCHAR(255),   -- lien vers le PDF du certificat
    est_valide      BOOLEAN         DEFAULT TRUE,
    score_final     DECIMAL(5,2),   -- score obtenu pour avoir le certificat

    -- Clés étrangères
    id_utilisateur  INT             NOT NULL,
    id_cours        INT             NOT NULL,

    -- Un seul certificat par utilisateur par cours
    CONSTRAINT uq_certificat UNIQUE (id_utilisateur, id_cours),

    CONSTRAINT pk_certificat PRIMARY KEY (id_certificat),

    CONSTRAINT fk_cert_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_cert_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : profils_formateur
-- Informations supplémentaires pour les formateurs
-- ═══ PARTIE : ALPHA ═══
-- ---------------------------------------------------------------
CREATE TABLE profils_formateur (
    id_profil       INT             NOT NULL AUTO_INCREMENT,
    titre_professionnel VARCHAR(150),  -- ex: "Développeur Full Stack Senior"
    specialites     TEXT,              -- domaines d'expertise
    experience_annees INT,
    site_web        VARCHAR(255),
    linkedin        VARCHAR(255),
    github          VARCHAR(255),
    nb_cours_publies INT             DEFAULT 0,
    nb_apprenants   INT             DEFAULT 0,
    note_globale    DECIMAL(3,2)    DEFAULT 0.00,
    est_certifie    BOOLEAN         DEFAULT FALSE,  -- formateur certifié ODC
    date_validation DATETIME,

    -- Clé étrangère (1 formateur = 1 profil)
    id_utilisateur  INT             NOT NULL UNIQUE,

    CONSTRAINT pk_profil PRIMARY KEY (id_profil),

    CONSTRAINT fk_profil_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : statistiques_formateur
-- Statistiques détaillées par cours pour le formateur
-- ═══ PARTIE : ALPHA ═══
-- ---------------------------------------------------------------
CREATE TABLE statistiques_formateur (
    id_stat         INT             NOT NULL AUTO_INCREMENT,
    mois            INT             NOT NULL,  -- 1-12
    annee           INT             NOT NULL,
    nb_nouvelles_inscriptions INT   DEFAULT 0,
    nb_completions  INT             DEFAULT 0,
    revenus         DECIMAL(10,2)   DEFAULT 0.00,
    nb_vues         INT             DEFAULT 0,
    note_moyenne    DECIMAL(3,2)    DEFAULT 0.00,
    date_calcul     DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Clés étrangères
    id_formateur    INT             NOT NULL,
    id_cours        INT             NOT NULL,

    CONSTRAINT pk_stat PRIMARY KEY (id_stat),

    CONSTRAINT fk_stat_formateur
        FOREIGN KEY (id_formateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_stat_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : notifications
-- Notifications envoyées aux utilisateurs
-- ═══ PARTIE : ALPHA ═══
-- ---------------------------------------------------------------
CREATE TABLE notifications (
    id_notification INT             NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(200)    NOT NULL,
    message         TEXT            NOT NULL,
    type_notif      ENUM('info','succes','avertissement','erreur') DEFAULT 'info',
    est_lue         BOOLEAN         DEFAULT FALSE,
    lien            VARCHAR(255),   -- lien de redirection au clic
    date_creation   DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Clé étrangère
    id_utilisateur  INT             NOT NULL,

    CONSTRAINT pk_notification PRIMARY KEY (id_notification),

    CONSTRAINT fk_notif_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ---------------------------------------------------------------
-- TABLE : messages_formateur
-- Messagerie entre apprenants et formateurs
-- ═══ PARTIE : ALPHA ═══
-- ---------------------------------------------------------------
CREATE TABLE messages_formateur (
    id_message      INT             NOT NULL AUTO_INCREMENT,
    sujet           VARCHAR(200),
    contenu         TEXT            NOT NULL,
    est_lu          BOOLEAN         DEFAULT FALSE,
    date_envoi      DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Clés étrangères
    id_expediteur   INT             NOT NULL,
    id_destinataire INT             NOT NULL,
    id_cours        INT,            -- contexte du message (optionnel)

    CONSTRAINT pk_message PRIMARY KEY (id_message),

    CONSTRAINT fk_msg_expediteur
        FOREIGN KEY (id_expediteur)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_msg_destinataire
        FOREIGN KEY (id_destinataire)
        REFERENCES utilisateurs(id_utilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_msg_cours
        FOREIGN KEY (id_cours)
        REFERENCES cours(id_cours)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ================================================================
-- DONNÉES DE TEST
-- ================================================================

-- Catégories
INSERT INTO categories (nom, description, couleur) VALUES
('Développement Web',    'HTML, CSS, JavaScript, React, Spring Boot', '#3B82F6'),
('Data Science',         'Python, Machine Learning, IA',              '#8B5CF6'),
('Design UI/UX',         'Figma, Adobe XD, Design Thinking',          '#EC4899'),
('DevOps',               'Docker, CI/CD, Linux, Cloud',               '#10B981'),
('Mobile',               'Android, iOS, Flutter, React Native',       '#F59E0B');

-- Utilisateurs de test
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES
('Diallo',   'Mamadou Oury',  'oury@odc.gn',     '$2a$10$hash1', 'admin'),
('Diakite',  'Mariame',       'mariame@odc.gn',  '$2a$10$hash2', 'formateur'),
('Diallo',   'Alpha',         'alpha@odc.gn',    '$2a$10$hash3', 'formateur'),
('Balde',    'Kadiatou',      'kadiatou@odc.gn', '$2a$10$hash4', 'apprenant'),
('Camara',   'Ibrahima',      'ibra@odc.gn',     '$2a$10$hash5', 'apprenant'),
('Barry',    'Fatoumata',     'fatou@odc.gn',    '$2a$10$hash6', 'apprenant');

-- Profils formateurs
INSERT INTO profils_formateur (id_utilisateur, titre_professionnel, specialites, experience_annees, est_certifie) VALUES
(2, 'Développeuse Full Stack', 'React, Spring Boot, MariaDB', 3, TRUE),
(3, 'Ingénieur Logiciel',      'Java, DevOps, Cloud',          4, TRUE);

-- Cours de test
INSERT INTO cours (titre, description, niveau, est_publie, est_certifiant, id_formateur, id_categorie) VALUES
('React.js pour débutants',        'Apprenez React depuis zéro', 'debutant',      TRUE, TRUE,  2, 1),
('Spring Boot & API REST',         'Créer des APIs avec Spring', 'intermediaire', TRUE, TRUE,  2, 1),
('Introduction au Machine Learning','ML avec Python & Scikit',   'intermediaire', TRUE, FALSE, 3, 2);

-- Sections de cours
INSERT INTO sections_cours (titre, ordre, id_cours) VALUES
('Introduction et Installation', 1, 1),
('Les composants React',         2, 1),
('Les Hooks',                    3, 1),
('Introduction à Spring Boot',   1, 2),
('Créer votre première API',     2, 2);

-- Ressources
INSERT INTO ressources (titre, type_ressource, url, duree, est_gratuit, ordre, id_section, id_cours) VALUES
('Installation de React',          'video',    '/uploads/videos/install-react.mp4',    600,  TRUE,  1, 1, 1),
('Slides Introduction React',      'pdf',      '/uploads/docs/intro-react.pdf',        NULL, TRUE,  2, 1, 1),
('Votre premier composant',        'video',    '/uploads/videos/composant-react.mp4',  900,  FALSE, 1, 2, 1),
('Introduction Spring Boot',       'video',    '/uploads/videos/spring-intro.mp4',     750,  TRUE,  1, 4, 2),
('Créer un endpoint GET',          'video',    '/uploads/videos/spring-get.mp4',       1200, FALSE, 1, 5, 2);

-- Inscriptions
INSERT INTO inscriptions_cours (id_utilisateur, id_cours) VALUES
(4, 1), (4, 2),
(5, 1), (5, 3),
(6, 2), (6, 3);

-- Quiz
INSERT INTO quiz (titre, note_passage, nb_tentatives, id_cours, id_section) VALUES
('Quiz - Les Composants React', 60.00, 3, 1, 2),
('Quiz Final - React.js',       70.00, 2, 1, NULL),
('Quiz - Spring Boot Bases',    65.00, 3, 2, 4);

-- Questions
INSERT INTO questions (enonce, type_question, points, id_quiz) VALUES
('Qu\'est-ce qu\'un composant React ?',                     'choix_unique',   1.0, 1),
('Quels hooks sont disponibles nativement dans React ?',    'choix_multiple', 2.0, 1),
('React utilise un DOM virtuel. Vrai ou Faux ?',           'vrai_faux',      1.0, 1);

-- Réponses
INSERT INTO reponses (contenu, est_correcte, ordre, id_question) VALUES
('Une fonction JavaScript qui retourne du JSX',     TRUE,  1, 1),
('Un fichier HTML spécial',                         FALSE, 2, 1),
('Une balise HTML personnalisée',                   FALSE, 3, 1),
('useState',   TRUE,  1, 2),
('useEffect',  TRUE,  2, 2),
('useDatabase',FALSE, 3, 2),
('useRouter',  FALSE, 4, 2),
('Vrai',       TRUE,  1, 3),
('Faux',       FALSE, 2, 3);


-- ================================================================
-- VUES UTILES POUR LES REQUÊTES FRÉQUENTES
-- ================================================================

-- Vue : cours avec infos complètes
CREATE VIEW vue_cours_complets AS
SELECT
    c.id_cours,
    c.titre,
    c.description,
    c.niveau,
    c.prix,
    c.est_publie,
    c.est_certifiant,
    c.note_moyenne,
    CONCAT(u.prenom, ' ', u.nom) AS formateur,
    cat.nom                       AS categorie,
    COUNT(DISTINCT ic.id_utilisateur) AS nb_apprenants,
    COUNT(DISTINCT r.id_ressource)    AS nb_ressources
FROM cours c
JOIN utilisateurs u      ON c.id_formateur  = u.id_utilisateur
LEFT JOIN categories cat ON c.id_categorie  = cat.id_categorie
LEFT JOIN inscriptions_cours ic ON c.id_cours = ic.id_cours
LEFT JOIN sections_cours sc     ON c.id_cours = sc.id_cours
LEFT JOIN ressources r          ON sc.id_section = r.id_section
GROUP BY c.id_cours;

-- Vue : progression globale d'un apprenant par cours
CREATE VIEW vue_progression_apprenant AS
SELECT
    u.id_utilisateur,
    CONCAT(u.prenom, ' ', u.nom) AS apprenant,
    c.id_cours,
    c.titre AS cours,
    COUNT(r.id_ressource)                              AS total_ressources,
    COUNT(p.id_progression)                            AS ressources_vues,
    ROUND(
        COUNT(p.id_progression) * 100.0 / NULLIF(COUNT(r.id_ressource), 0)
    , 2)                                               AS progression_pct
FROM utilisateurs u
JOIN inscriptions_cours ic  ON u.id_utilisateur = ic.id_utilisateur
JOIN cours c                ON ic.id_cours      = c.id_cours
JOIN sections_cours sc      ON c.id_cours       = sc.id_cours
JOIN ressources r           ON sc.id_section    = r.id_section
LEFT JOIN progression p     ON r.id_ressource   = p.id_ressource
                           AND u.id_utilisateur = p.id_utilisateur
WHERE u.role = 'apprenant'
GROUP BY u.id_utilisateur, c.id_cours;


-- ================================================================
-- RÉSUMÉ DES TABLES PAR RESPONSABLE
-- ================================================================
--
--  OURY (Création cours + Ressources) :
--    ✅ categories
--    ✅ cours
--    ✅ sections_cours
--    ✅ ressources
--    ✅ commentaires_cours
--
--  MARIAME (Quiz + Suivi progression) :
--    ✅ inscriptions_cours
--    ✅ quiz
--    ✅ questions
--    ✅ reponses
--    ✅ tentatives_quiz
--    ✅ reponses_apprenant
--    ✅ progression
--
--  ALPHA (Certificats + Espace formateur) :
--    ✅ certificats
--    ✅ profils_formateur
--    ✅ statistiques_formateur
--    ✅ notifications
--    ✅ messages_formateur
--
--  PARTAGÉES (tout le groupe) :
--    ✅ utilisateurs
--
-- ================================================================
