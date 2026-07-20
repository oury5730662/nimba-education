package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Certificat
// Table : certificats
// ================================================================

@Entity
@Table(name = "certificats",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"id_utilisateur", "id_cours"}
       ))
@Data @NoArgsConstructor @AllArgsConstructor
public class Certificat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_certificat")
    private Integer idCertificat;

    @Column(name = "numero_certificat", nullable = false, unique = true, length = 50)
    private String numeroCertificat; // ex: NIMBA-2026-00001

    @Column(name = "date_emission")
    private LocalDateTime dateEmission = LocalDateTime.now();

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(name = "url_pdf", length = 255)
    private String urlPdf;

    @Column(name = "est_valide")
    private Boolean estValide = true;

    @Column(name = "score_final", precision = 5, scale = 2)
    private BigDecimal scoreFinal;

    // Le certificat n'est délivré (PDF généré) qu'après validation manuelle
    // par le formateur du cours concerné
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_validation", nullable = false)
    private StatutValidation statutValidation = StatutValidation.en_attente;

    @Column(name = "commentaire_validation", columnDefinition = "TEXT")
    private String commentaireValidation;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    // FK → utilisateurs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    // FK → cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cours", nullable = false)
    private Cours cours;

    public enum StatutValidation {
        en_attente, valide, refuse
    }
}
