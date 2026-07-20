package com.odc.elearning.service;

import com.odc.elearning.entity.Categorie;
import com.odc.elearning.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// ================================================================
// CategorieService
// ================================================================

@Service
public class CategorieService {

    @Autowired private CategorieRepository categorieRepository;

    public Categorie creer(Categorie categorie) {
        if (categorieRepository.existsByNom(categorie.getNom())) {
            throw new RuntimeException("Cette catégorie existe déjà !");
        }
        return categorieRepository.save(categorie);
    }

    public List<Categorie> listerTous() {
        return categorieRepository.findAll();
    }

    public Categorie trouverParId(Integer id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable !"));
    }

    public Categorie modifier(Integer id, Categorie modifiee) {
        Categorie cat = trouverParId(id);
        cat.setNom(modifiee.getNom());
        cat.setDescription(modifiee.getDescription());
        cat.setIcone(modifiee.getIcone());
        cat.setCouleur(modifiee.getCouleur());
        return categorieRepository.save(cat);
    }

    public void supprimer(Integer id) {
        categorieRepository.deleteById(id);
    }
}
