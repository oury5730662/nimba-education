package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Progression
// Table : progression
// ================================================================

@Entity
@Table(name = "progression",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"id_utilisateur", "id_ressource"}
       ))
@Data @NoArgsConstructor @AllArgsConstructor
public class Progression {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_progression")
    private Integer idProgression;

    @Column(name = "est_complete")
    private Boolean estComplete = false;

    @Column(name = "pourcentage", precision = 5, scale = 2)
    private BigDecimal pourcentage = BigDecimal.ZERO;

    @Column(name = "temps_passe")
    private Integer tempsPasse = 0; // en secondes

    @Column(name = "derniere_position")
    private Integer dernierePosition = 0; // en secondes (pour vidéos)

    @Column(name = "date_debut")
    private LocalDateTime dateDebut = LocalDateTime.now();

    @Column(name = "date_completion")
    private LocalDateTime dateCompletion;

    // FK → utilisateurs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    // FK → ressources
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ressource", nullable = false)
    private Ressource ressource;

    // FK → cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cours", nullable = false)
    private Cours cours;
}
