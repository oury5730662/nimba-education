package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// ================================================================
// ProgressionService
// ================================================================

@Service
public class ProgressionService {

    @Autowired private ProgressionRepository progressionRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private RessourceRepository ressourceRepository;
    @Autowired private CoursRepository coursRepository;
    @Autowired private InscriptionCoursRepository inscriptionRepository;

    // Marquer une ressource comme vue / mise à jour
    // Appelée très fréquemment (heartbeat vidéo toutes les 10s, auto-complétion
    // PDF/document/lien) : doit rester tolérante à des appels rapprochés/concurrents.
    public Progression mettreAJour(Integer idUtilisateur, Integer idRessource,
                                    Integer idCours, Integer position, Boolean estComplete) {
        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));
        Ressource ressource = ressourceRepository.findById(idRessource)
                .orElseThrow(() -> new RuntimeException("Ressource introuvable !"));
        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new RuntimeException("Cours introuvable !"));

        // Chercher progression existante ou en créer une nouvelle
        Progression progression = progressionRepository
                .findByUtilisateurIdUtilisateurAndRessourceIdRessource(idUtilisateur, idRessource)
                .orElse(new Progression());

        progression.setUtilisateur(utilisateur);
        progression.setRessource(ressource);
        progression.setCours(cours);
        progression.setDernierePosition(position);

        if (Boolean.TRUE.equals(estComplete)) {
            progression.setEstComplete(true);
            progression.setPourcentage(BigDecimal.valueOf(100));
            progression.setDateCompletion(LocalDateTime.now());
        }

        try {
            return progressionRepository.save(progression);
        } catch (DataIntegrityViolationException e) {
            // Deux requêtes quasi simultanées (ex: heartbeat + bascule de ressource) ont
            // toutes deux tenté de créer la ligne : l'autre a gagné la course, on
            // récupère la ligne désormais existante et on y applique notre mise à jour.
            Progression existante = progressionRepository
                    .findByUtilisateurIdUtilisateurAndRessourceIdRessource(idUtilisateur, idRessource)
                    .orElseThrow(() -> e);
            existante.setDernierePosition(position);
            if (Boolean.TRUE.equals(estComplete)) {
                existante.setEstComplete(true);
                existante.setPourcentage(BigDecimal.valueOf(100));
                existante.setDateCompletion(LocalDateTime.now());
            }
            return progressionRepository.save(existante);
        }
    }

    // Obtenir la progression d'un apprenant dans un cours
    public List<Progression> obtenirProgressionCours(Integer idUtilisateur, Integer idCours) {
        return progressionRepository
                .findByUtilisateurIdUtilisateurAndCoursIdCours(idUtilisateur, idCours);
    }

    // Calculer le pourcentage global d'un apprenant dans un cours
    public double calculerPourcentageGlobal(Integer idUtilisateur, Integer idCours) {
        List<Ressource> toutesRessources = ressourceRepository
                .findByCoursIdCoursOrderByOrdreAsc(idCours);
        if (toutesRessources.isEmpty()) return 0;

        long completees = progressionRepository
                .countRessourcesCompletees(idUtilisateur, idCours);

        return (double) completees / toutesRessources.size() * 100;
    }

    // S'inscrire à un cours
    public InscriptionCours inscrireAuCours(Integer idUtilisateur, Integer idCours) {
        if (inscriptionRepository.existsByUtilisateurIdUtilisateurAndCoursIdCours(
                idUtilisateur, idCours)) {
            throw new RuntimeException("Vous êtes déjà inscrit à ce cours !");
        }

        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));
        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new RuntimeException("Cours introuvable !"));

        InscriptionCours inscription = new InscriptionCours();
        inscription.setUtilisateur(utilisateur);
        inscription.setCours(cours);
        return inscriptionRepository.save(inscription);
    }

    public List<InscriptionCours> mesInscriptions(Integer idUtilisateur) {
        return inscriptionRepository.findByUtilisateurIdUtilisateur(idUtilisateur);
    }
}
