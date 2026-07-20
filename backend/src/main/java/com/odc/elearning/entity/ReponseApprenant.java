package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;

// ================================================================
// ENTITY : ReponseApprenant
// Table : reponses_apprenant
// ================================================================

@Entity
@Table(name = "reponses_apprenant")
@Data @NoArgsConstructor @AllArgsConstructor
public class ReponseApprenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "reponse_texte", columnDefinition = "TEXT")
    private String reponseTexte; // Pour les questions texte libre

    // FK → tentatives_quiz
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tentative", nullable = false)
    private TentativeQuiz tentative;

    // FK → questions
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_question", nullable = false)
    private Question question;

    // FK → reponses (null si texte libre)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reponse")
    private Reponse reponse;
}
