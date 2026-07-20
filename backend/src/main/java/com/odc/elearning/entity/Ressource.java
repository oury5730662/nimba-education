package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Ressource
// Table : ressources
// Fonctionnalité 2 — DIALLO Mamadou Oury
// ================================================================

@Entity
@Table(name = "ressources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ressource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ressource")
    private Integer idRessource;

    @Column(name = "titre", nullable = false, length = 200)
    private String titre;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_ressource", nullable = false)
    private TypeRessource typeRessource;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "nom_fichier", length = 255)
    private String nomFichier;

    @Column(name = "taille_fichier")
    private Long tailleFichier;

    @Column(name = "duree")
    private Integer duree;

    @Column(name = "est_gratuit")
    private Boolean estGratuit = false;

    @Column(name = "ordre", nullable = false)
    private Integer ordre = 1;

    @Column(name = "nb_telechargements")
    private Integer nbTelechargements = 0;

    @Column(name = "date_ajout")
    private LocalDateTime dateAjout = LocalDateTime.now();

    // Clé étrangère → sections_cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_section", nullable = false)
    private SectionCours section;

    // Clé étrangère → cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cours", nullable = false)
    private Cours cours;

    // Enum correspondant à la base de données
    public enum TypeRessource {
        video, pdf, lien, image, document
    }
}
