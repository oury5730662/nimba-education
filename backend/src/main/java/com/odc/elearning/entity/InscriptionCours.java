package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : InscriptionCours
// Table : inscriptions_cours
// Un apprenant s'inscrit à un cours
// ================================================================

@Entity
@Table(name = "inscriptions_cours",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"id_utilisateur", "id_cours"}
       ))
@Data @NoArgsConstructor @AllArgsConstructor
public class InscriptionCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inscription")
    private Integer idInscription;

    @Column(name = "date_inscription")
    private LocalDateTime dateInscription = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private Statut statut = Statut.en_cours;

    @Column(name = "prix_paye", precision = 10, scale = 2)
    private BigDecimal prixPaye = BigDecimal.ZERO;

    // FK → utilisateurs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    // FK → cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cours", nullable = false)
    private Cours cours;

    public enum Statut {
        en_cours, termine, abandonne
    }
}
