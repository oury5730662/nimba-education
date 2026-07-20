package com.odc.elearning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Utilisateur
// Table : utilisateurs
// Utilisée par TOUT le groupe (authentification)
// ================================================================

@Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur")
    private Integer idUtilisateur;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    // WRITE_ONLY : accepté en entrée JSON mais jamais renvoyé dans les réponses
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.apprenant;

    @Column(name = "photo_profil", length = 255)
    private String photoProfil;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "date_inscription")
    private LocalDateTime dateInscription = LocalDateTime.now();

    @Column(name = "est_actif")
    private Boolean estActif = true;

    @JsonIgnore
    @Column(name = "token_reset", length = 255)
    private String tokenReset;

    // Enum correspondant à la base de données
    public enum Role {
        apprenant, formateur, admin
    }
}
