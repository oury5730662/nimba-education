package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// ================================================================
// FormateurService — Espace formateur
// ================================================================

@Service
public class FormateurService {

    @Autowired private ProfilFormateurRepository profilRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private CoursRepository coursRepository;
    @Autowired private InscriptionCoursRepository inscriptionRepository;
    @Autowired private MessageFormateurRepository messageRepository;

    // Créer ou mettre à jour le profil formateur
    public ProfilFormateur sauvegarderProfil(ProfilFormateur profil, Integer idUtilisateur) {
        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        ProfilFormateur existing = profilRepository
                .findByUtilisateurIdUtilisateur(idUtilisateur)
                .orElse(new ProfilFormateur());

        existing.setUtilisateur(utilisateur);
        existing.setTitreProfessionnel(profil.getTitreProfessionnel());
        existing.setSpecialites(profil.getSpecialites());
        existing.setExperienceAnnees(profil.getExperienceAnnees());
        existing.setSiteWeb(profil.getSiteWeb());
        existing.setLinkedin(profil.getLinkedin());
        existing.setGithub(profil.getGithub());

        return profilRepository.save(existing);
    }

    public ProfilFormateur obtenirProfil(Integer idUtilisateur) {
        return profilRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("Profil formateur introuvable !"));
    }

    // Statistiques du formateur
    public java.util.Map<String, Object> obtenirStatistiques(Integer idFormateur) {
        List<Cours> mesCours = coursRepository.findByFormateurIdUtilisateur(idFormateur);
        long totalApprenants = mesCours.stream()
                .mapToLong(c -> inscriptionRepository.countByCoursIdCours(c.getIdCours()))
                .sum();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalCours", mesCours.size());
        stats.put("totalApprenants", totalApprenants);
        stats.put("coursPublies", mesCours.stream()
                .filter(Cours::getEstPublie).count());
        return stats;
    }

    // Envoyer un message
    public MessageFormateur envoyerMessage(MessageFormateur message,
                                            Integer idExpediteur, Integer idDestinataire) {
        Utilisateur expediteur = utilisateurRepository.findById(idExpediteur)
                .orElseThrow(() -> new RuntimeException("Expéditeur introuvable !"));
        Utilisateur destinataire = utilisateurRepository.findById(idDestinataire)
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable !"));

        message.setExpediteur(expediteur);
        message.setDestinataire(destinataire);
        return messageRepository.save(message);
    }

    public List<MessageFormateur> mesMessages(Integer idUtilisateur) {
        return messageRepository
                .findByDestinataireIdUtilisateurOrderByDateEnvoiDesc(idUtilisateur);
    }

    public MessageFormateur marquerLu(Integer idMessage) {
        MessageFormateur msg = messageRepository.findById(idMessage)
                .orElseThrow(() -> new RuntimeException("Message introuvable !"));
        msg.setEstLu(true);
        return messageRepository.save(msg);
    }
}
