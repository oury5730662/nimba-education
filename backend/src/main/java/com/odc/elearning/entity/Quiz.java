package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Quiz
// Table : quiz
// ================================================================

@Entity
@Table(name = "quiz")
@Data @NoArgsConstructor @AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_quiz")
    private Integer idQuiz;

    @Column(name = "titre", nullable = false, length = 200)
    private String titre;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "duree_limite")
    private Integer dureeLimit; // en minutes

    @Column(name = "note_passage", precision = 5, scale = 2)
    private BigDecimal notePassage = new BigDecimal("50.00");

    @Column(name = "nb_tentatives")
    private Integer nbTentatives = 3;

    @Column(name = "est_actif")
    private Boolean estActif = true;

    // Distingue le quiz d'évaluation finale (conditionne l'obtention du
    // certificat) des quiz de chapitre classiques
    @Column(name = "est_quiz_final")
    private Boolean estQuizFinal = false;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    // FK → cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cours", nullable = false)
    private Cours cours;

    // FK → sections_cours (optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_section")
    private SectionCours section;
}
