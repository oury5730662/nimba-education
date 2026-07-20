package com.odc.elearning.controller;

import com.odc.elearning.dto.ModifierProfilRequest;
import com.odc.elearning.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// ================================================================
// UtilisateurController — /api/utilisateurs
// ================================================================

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UtilisateurController {

    @Autowired private UtilisateurService utilisateurService;

    // GET /api/utilisateurs/{id} — infos publiques (le mot de passe et le
    // jeton de reset sont déjà exclus de la sérialisation de l'entité)
    @GetMapping("/{id}")
    public ResponseEntity<?> trouverParId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(utilisateurService.trouverParId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/utilisateurs/{id} — modifie nom, prénom, photo, bio
    // (email et rôle volontairement exclus de ModifierProfilRequest)
    @PutMapping("/{id}")
    public ResponseEntity<?> modifierProfil(@PathVariable Integer id,
                                             @RequestBody ModifierProfilRequest request) {
        try {
            return ResponseEntity.ok(utilisateurService.modifierProfil(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }
}
