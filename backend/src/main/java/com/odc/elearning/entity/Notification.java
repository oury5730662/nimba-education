package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Notification — Table : notifications
// ================================================================

@Entity
@Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notification")
    private Integer idNotification;

    @Column(name = "titre", nullable = false, length = 200)
    private String titre;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_notif")
    private TypeNotif typeNotif = TypeNotif.info;

    @Column(name = "est_lue")
    private Boolean estLue = false;

    @Column(name = "lien", length = 255)
    private String lien;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    // FK → utilisateurs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    public enum TypeNotif {
        info, succes, avertissement, erreur
    }
}
