// ================================================================
// DTO : ApprenantInscritResponse.java
// Infos d'un apprenant inscrit à un cours, pour l'espace formateur
// ================================================================
package com.odc.elearning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprenantInscritResponse {

    private Integer idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private LocalDateTime dateInscription;
    private String statut;
    private double pourcentageProgression;
}
