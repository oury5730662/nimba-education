package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;

// ================================================================
// ENTITY : Reponse
// Table : reponses
// ================================================================

@Entity
@Table(name = "reponses")
@Data @NoArgsConstructor @AllArgsConstructor
public class Reponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reponse")
    private Integer idReponse;

    @Column(name = "contenu", columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Column(name = "est_correcte")
    private Boolean estCorrecte = false;

    @Column(name = "ordre")
    private Integer ordre = 1;

    // FK → questions
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_question", nullable = false)
    private Question question;
}
