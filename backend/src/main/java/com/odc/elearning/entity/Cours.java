package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Cours
// Table : cours
// Fonctionnalité 1 — DIALLO Mamadou Oury
// ================================================================

@Entity
@Table(name = "cours")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cours")
    private Integer idCours;

    @Column(name = "titre", nullable = false, length = 200)
    private String titre;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "contenu", columnDefinition = "LONGTEXT")
    private String contenu;

    @Column(name = "image_couverture", length = 255)
    private String imageCouverture;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau")
    private Niveau niveau = Niveau.debutant;

    @Column(name = "duree_estimee")
    private Integer dureeEstimee;

    @Column(name = "prix", precision = 10, scale = 2)
    private BigDecimal prix = BigDecimal.ZERO;

    @Column(name = "est_publie")
    private Boolean estPublie = false;

    @Column(name = "est_certifiant")
    private Boolean estCertifiant = false;

    @Column(name = "nb_vues")
    private Integer nbVues = 0;

    @Column(name = "note_moyenne", precision = 3, scale = 2)
    private BigDecimal noteMoyenne = BigDecimal.ZERO;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    // Clé étrangère → utilisateurs (le formateur)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_formateur", nullable = false)
    private Utilisateur formateur;

    // Clé étrangère → categories
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie")
    private Categorie categorie;

    // Enum correspondant à la base de données
    public enum Niveau {
        debutant, intermediaire, avance
    }

    // Mettre à jour la date de modification automatiquement
    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
