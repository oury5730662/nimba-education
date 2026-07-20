// ================================================================
// DTO : ModifierProfilRequest.java
// Champs modifiables via PUT /api/utilisateurs/{id} — n'inclut
// volontairement PAS l'email ni le rôle, qui ne changent pas ici
// ================================================================
package com.odc.elearning.dto;

import lombok.Data;

@Data
public class ModifierProfilRequest {
    private String nom;
    private String prenom;
    private String photoProfil;
    private String bio;
}
