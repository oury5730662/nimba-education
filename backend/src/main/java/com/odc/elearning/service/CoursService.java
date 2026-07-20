package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// ================================================================
// CoursService — Logique métier pour les cours
// ================================================================

@Service
public class CoursService {

    @Autowired private CoursRepository coursRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private CategorieRepository categorieRepository;
    @Autowired private InscriptionCoursRepository inscriptionRepository;

    // ── Créer un cours ────────────────────────────────────────
    public Cours creer(Cours cours, Integer idFormateur, Integer idCategorie) {
        Utilisateur formateur = utilisateurRepository.findById(idFormateur)
                .orElseThrow(() -> new RuntimeException("Formateur introuvable !"));
        cours.setFormateur(formateur);

        if (idCategorie != null) {
            Categorie categorie = categorieRepository.findById(idCategorie)
                    .orElseThrow(() -> new RuntimeException("Catégorie introuvable !"));
            cours.setCategorie(categorie);
        }
        return coursRepository.save(cours);
    }

    // ── Lister tous les cours ─────────────────────────────────
    public List<Cours> listerTous() {
        return coursRepository.findAll();
    }

    // ── Lister les cours publiés ──────────────────────────────
    public List<Cours> listerPublies() {
        return coursRepository.findByEstPublieTrue();
    }

    // ── Lister les cours d'un formateur ───────────────────────
    public List<Cours> listerParFormateur(Integer idFormateur) {
        return coursRepository.findByFormateurIdUtilisateur(idFormateur);
    }

    // ── Trouver un cours par ID ───────────────────────────────
    public Cours trouverParId(Integer id) {
        return coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable !"));
    }

    // ── Modifier un cours ─────────────────────────────────────
    public Cours modifier(Integer id, Cours coursModifie, Integer idCategorie) {
        Cours cours = trouverParId(id);
        cours.setTitre(coursModifie.getTitre());
        cours.setDescription(coursModifie.getDescription());
        cours.setContenu(coursModifie.getContenu());
        cours.setImageCouverture(coursModifie.getImageCouverture());
        cours.setNiveau(coursModifie.getNiveau());
        cours.setDureeEstimee(coursModifie.getDureeEstimee());
        cours.setPrix(coursModifie.getPrix());
        cours.setEstPublie(coursModifie.getEstPublie());
        cours.setEstCertifiant(coursModifie.getEstCertifiant());

        if (idCategorie != null) {
            Categorie categorie = categorieRepository.findById(idCategorie)
                    .orElseThrow(() -> new RuntimeException("Catégorie introuvable !"));
            cours.setCategorie(categorie);
        }
        return coursRepository.save(cours);
    }

    // ── Supprimer un cours ────────────────────────────────────
    public void supprimer(Integer id, Integer idFormateur) {
        Cours cours = trouverParId(id);

        if (!cours.getFormateur().getIdUtilisateur().equals(idFormateur)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce cours !");
        }

        long nbInscrits = inscriptionRepository.countByCoursIdCours(id);
        if (nbInscrits > 0) {
            throw new RuntimeException(
                "Impossible de supprimer ce cours : " + nbInscrits +
                " apprenant(s) y sont déjà inscrit(s).");
        }

        coursRepository.deleteById(id);
    }

    // ── Publier / Dépublier ───────────────────────────────────
    public Cours togglePublication(Integer id) {
        Cours cours = trouverParId(id);
        cours.setEstPublie(!cours.getEstPublie());
        return coursRepository.save(cours);
    }
}
