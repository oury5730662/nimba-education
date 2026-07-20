package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

// ================================================================
// ENTITY : Categorie
// Table : categories
// ================================================================

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categorie")
    private Integer idCategorie;

    @Column(name = "nom", nullable = false, unique = true, length = 100)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icone", length = 100)
    private String icone;

    @Column(name = "couleur", length = 7)
    private String couleur;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();
}
