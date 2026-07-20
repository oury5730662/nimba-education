package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : MessageFormateur — Table : messages_formateur
// ================================================================

@Entity
@Table(name = "messages_formateur")
@Data @NoArgsConstructor @AllArgsConstructor
public class MessageFormateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message")
    private Integer idMessage;

    @Column(name = "sujet", length = 200)
    private String sujet;

    @Column(name = "contenu", columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Column(name = "est_lu")
    private Boolean estLu = false;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    // FK → utilisateurs (expéditeur)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediteur", nullable = false)
    private Utilisateur expediteur;

    // FK → utilisateurs (destinataire)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_destinataire", nullable = false)
    private Utilisateur destinataire;

    // FK → cours (contexte du message, optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cours")
    private Cours cours;
}
