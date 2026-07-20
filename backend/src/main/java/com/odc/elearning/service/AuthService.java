package com.odc.elearning.service;

import com.odc.elearning.dto.AuthResponse;
import com.odc.elearning.dto.InscriptionRequest;
import com.odc.elearning.dto.LoginRequest;
import com.odc.elearning.entity.Utilisateur;
import com.odc.elearning.repository.UtilisateurRepository;
import com.odc.elearning.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// ================================================================
// AuthService — Inscription et Connexion
// ================================================================

@Service
public class AuthService {

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    // ── Inscription ──────────────────────────────────────────
    public AuthResponse inscrire(InscriptionRequest request) {

        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé !");
        }

        // Créer le nouvel utilisateur
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        // Encoder le mot de passe avec BCrypt
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));

        // Définir le rôle
        try {
            utilisateur.setRole(Utilisateur.Role.valueOf(request.getRole()));
        } catch (Exception e) {
            utilisateur.setRole(Utilisateur.Role.apprenant);
        }

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        // Générer le token JWT
        String token = jwtUtils.generateToken(saved.getEmail());

        return new AuthResponse(
                token,
                saved.getIdUtilisateur(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.getPhotoProfil()
        );
    }

    // ── Connexion ─────────────────────────────────────────────
    public AuthResponse connecter(LoginRequest request) {

        // 1. Chercher l'utilisateur par email
        Utilisateur utilisateur = utilisateurRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                    new RuntimeException("Email ou mot de passe incorrect !"));

        // 2. Vérifier le mot de passe avec BCrypt
        if (!passwordEncoder.matches(request.getMotDePasse(),
                utilisateur.getMotDePasse())) {
            throw new RuntimeException("Email ou mot de passe incorrect !");
        }

        // 3. Vérifier que le compte est actif
        if (!utilisateur.getEstActif()) {
            throw new RuntimeException(
                "Votre compte a été bloqué. Contactez un administrateur.");
        }

        // 4. Générer le token JWT
        String token = jwtUtils.generateToken(utilisateur.getEmail());

        return new AuthResponse(
                token,
                utilisateur.getIdUtilisateur(),
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getEmail(),
                utilisateur.getRole().name(),
                utilisateur.getPhotoProfil()
        );
    }
}