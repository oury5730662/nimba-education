package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : TentativeQuiz
// Table : tentatives_quiz
// ================================================================

@Entity
@Table(name = "tentatives_quiz")
@Data @NoArgsConstructor @AllArgsConstructor
public class TentativeQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tentative")
    private Integer idTentative;

    @Column(name = "score_obtenu", precision = 5, scale = 2)
    private BigDecimal scoreObtenu;

    @Column(name = "est_reussi")
    private Boolean estReussi = false;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut = LocalDateTime.now();

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "temps_passe")
    private Integer tempsPasse; // en secondes

    // FK → utilisateurs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    // FK → quiz
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quiz", nullable = false)
    private Quiz quiz;
}
