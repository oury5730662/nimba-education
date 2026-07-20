package com.odc.elearning.service;

import com.odc.elearning.dto.ModifierProfilRequest;
import com.odc.elearning.entity.Utilisateur;
import com.odc.elearning.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// ================================================================
// UtilisateurService
// ================================================================

@Service
public class UtilisateurService {

    @Autowired private UtilisateurRepository utilisateurRepository;

    public Utilisateur trouverParId(Integer id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));
    }

    // Met à jour uniquement nom, prénom, photo de profil et bio.
    // L'email et le rôle ne sont jamais modifiables via cette méthode.
    public Utilisateur modifierProfil(Integer id, ModifierProfilRequest request) {
        Utilisateur utilisateur = trouverParId(id);

        if (request.getNom() != null && !request.getNom().isBlank()) {
            utilisateur.setNom(request.getNom());
        }
        if (request.getPrenom() != null && !request.getPrenom().isBlank()) {
            utilisateur.setPrenom(request.getPrenom());
        }
        if (request.getPhotoProfil() != null) {
            utilisateur.setPhotoProfil(request.getPhotoProfil());
        }
        if (request.getBio() != null) {
            utilisateur.setBio(request.getBio());
        }

        return utilisateurRepository.save(utilisateur);
    }
}
