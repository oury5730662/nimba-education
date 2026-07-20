package com.odc.elearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ================================================================
// ENTITY : SectionCours
// Table : sections_cours
// Fonctionnalité 1 — DIALLO Mamadou Oury
// ================================================================

@Entity
@Table(name = "sections_cours")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_section")
    private Integer idSection;

    @Column(name = "titre", nullable = false, length = 200)
    private String titre;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ordre", nullable = false)
    private Integer ordre = 1;

    // Clé étrangère → cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cours", nullable = false)
    private Cours cours;
}
