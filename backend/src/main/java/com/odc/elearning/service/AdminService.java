package com.odc.elearning.service;

import com.odc.elearning.entity.Certificat;
import com.odc.elearning.entity.Utilisateur;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// ================================================================
// AdminService — Gestion des utilisateurs, statistiques globales
// ================================================================

@Service
public class AdminService {

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private CoursRepository coursRepository;
    @Autowired private InscriptionCoursRepository inscriptionRepository;
    @Autowired private CertificatRepository certificatRepository;

    // ── Lister les utilisateurs (filtre optionnel par rôle) ───
    public List<Utilisateur> listerUtilisateurs(String role) {
        if (role == null || role.isBlank()) {
            return utilisateurRepository.findAll();
        }
        Utilisateur.Role r;
        try {
            r = Utilisateur.Role.valueOf(role.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide : " + role);
        }
        return utilisateurRepository.findByRole(r);
    }

    // ── Bloquer un compte ──────────────────────────────────────
    public Utilisateur bloquer(Integer id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));
        utilisateur.setEstActif(false);
        return utilisateurRepository.save(utilisateur);
    }

    // ── Débloquer un compte ────────────────────────────────────
    public Utilisateur debloquer(Integer id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));
        utilisateur.setEstActif(true);
        return utilisateurRepository.save(utilisateur);
    }

    // ── Statistiques globales de la plateforme ─────────────────
    public Map<String, Object> obtenirStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUtilisateurs", utilisateurRepository.count());
        stats.put("totalApprenants", utilisateurRepository.countByRole(Utilisateur.Role.apprenant));
        stats.put("totalFormateurs", utilisateurRepository.countByRole(Utilisateur.Role.formateur));
        stats.put("totalAdmins", utilisateurRepository.countByRole(Utilisateur.Role.admin));
        stats.put("totalCours", coursRepository.count());
        stats.put("coursPublies", coursRepository.countByEstPublieTrue());
        stats.put("totalInscriptions", inscriptionRepository.count());
        stats.put("certificatsDelivres",
                certificatRepository.countByStatutValidation(Certificat.StatutValidation.valide));
        return stats;
    }
}
