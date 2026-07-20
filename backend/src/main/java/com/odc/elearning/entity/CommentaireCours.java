package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : CommentaireCours — Table : commentaires_cours
// ================================================================
@Entity @Table(name = "commentaires_cours")
@Data @NoArgsConstructor @AllArgsConstructor
class CommentaireCours {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_commentaire") private Integer idCommentaire;
    @Column(name = "contenu", columnDefinition = "TEXT", nullable = false) private String contenu;
    @Column(name = "note") private Integer note;
    @Column(name = "date_creation") private LocalDateTime dateCreation = LocalDateTime.now();
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_utilisateur", nullable = false) private Utilisateur utilisateur;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_cours", nullable = false) private Cours cours;
}
