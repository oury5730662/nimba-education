package com.odc.elearning.controller;

import com.odc.elearning.dto.*;
import com.odc.elearning.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// ================================================================
// AuthController — /api/auth
// Routes publiques : inscription et connexion
// ================================================================

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    @Autowired private AuthService authService;

    // POST /api/auth/inscription
    @PostMapping("/inscription")
    public ResponseEntity<?> inscription(@Valid @RequestBody InscriptionRequest request) {
        try {
            AuthResponse response = authService.inscrire(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("erreur", e.getMessage()));
        }
    }

    // POST /api/auth/connexion
    @PostMapping("/connexion")
    public ResponseEntity<?> connexion(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.connecter(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("erreur", e.getMessage()));
        }
    }
}
