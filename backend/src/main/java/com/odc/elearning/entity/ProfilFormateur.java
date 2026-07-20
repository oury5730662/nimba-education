package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : ProfilFormateur
// Table : profils_formateur
// ================================================================

@Entity
@Table(name = "profils_formateur")
@Data @NoArgsConstructor @AllArgsConstructor
public class ProfilFormateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_profil")
    private Integer idProfil;

    @Column(name = "titre_professionnel", length = 150)
    private String titreProfessionnel;

    @Column(name = "specialites", columnDefinition = "TEXT")
    private String specialites;

    @Column(name = "experience_annees")
    private Integer experienceAnnees;

    @Column(name = "site_web", length = 255)
    private String siteWeb;

    @Column(name = "linkedin", length = 255)
    private String linkedin;

    @Column(name = "github", length = 255)
    private String github;

    @Column(name = "nb_cours_publies")
    private Integer nbCoursPublies = 0;

    @Column(name = "nb_apprenants")
    private Integer nbApprenants = 0;

    @Column(name = "note_globale", precision = 3, scale = 2)
    private BigDecimal noteGlobale = BigDecimal.ZERO;

    @Column(name = "est_certifie")
    private Boolean estCertifie = false;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    // FK → utilisateurs (1 formateur = 1 profil)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false, unique = true)
    private Utilisateur utilisateur;
}
