package com.odc.elearning.controller;

import com.odc.elearning.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// ================================================================
// AdminController — /api/admin
// Réservé aux utilisateurs de rôle ADMIN (voir SecurityConfig)
// ================================================================

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    @Autowired private AdminService adminService;

    // GET /api/admin/utilisateurs?role=formateur — Liste des utilisateurs
    @GetMapping("/utilisateurs")
    public ResponseEntity<?> listerUtilisateurs(@RequestParam(required = false) String role) {
        try {
            return ResponseEntity.ok(adminService.listerUtilisateurs(role));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // PATCH /api/admin/utilisateurs/{id}/bloquer
    @PatchMapping("/utilisateurs/{id}/bloquer")
    public ResponseEntity<?> bloquer(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(adminService.bloquer(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // PATCH /api/admin/utilisateurs/{id}/debloquer
    @PatchMapping("/utilisateurs/{id}/debloquer")
    public ResponseEntity<?> debloquer(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(adminService.debloquer(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // GET /api/admin/statistiques
    @GetMapping("/statistiques")
    public ResponseEntity<?> statistiques() {
        return ResponseEntity.ok(adminService.obtenirStatistiques());
    }
}
