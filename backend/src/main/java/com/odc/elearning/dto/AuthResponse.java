// ================================================================
// DTO 3 : AuthResponse.java (réponse après connexion)
// ================================================================
package com.odc.elearning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;           // JWT token
    private String type = "Bearer"; // Type du token
    private Integer id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String photoProfil;

    public AuthResponse(String token, Integer id, String nom,
                        String prenom, String email, String role, String photoProfil) {
        this.token       = token;
        this.id          = id;
        this.nom         = nom;
        this.prenom      = prenom;
        this.email       = email;
        this.role        = role;
        this.photoProfil = photoProfil;
    }
}
