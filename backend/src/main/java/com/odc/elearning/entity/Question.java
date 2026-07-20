package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

// ================================================================
// ENTITY : Question
// Table : questions
// ================================================================

@Entity
@Table(name = "questions")
@Data @NoArgsConstructor @AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_question")
    private Integer idQuestion;

    @Column(name = "enonce", columnDefinition = "TEXT", nullable = false)
    private String enonce;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_question", nullable = false)
    private TypeQuestion typeQuestion;

    @Column(name = "points", precision = 5, scale = 2)
    private BigDecimal points = new BigDecimal("1.00");

    @Column(name = "explication", columnDefinition = "TEXT")
    private String explication;

    @Column(name = "ordre")
    private Integer ordre = 1;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    // FK → quiz
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quiz", nullable = false)
    private Quiz quiz;

    public enum TypeQuestion {
        choix_unique, choix_multiple, vrai_faux, texte_libre
    }
}
