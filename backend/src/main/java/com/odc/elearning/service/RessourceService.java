package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// ================================================================
// RessourceService
// ================================================================

@Service
public class RessourceService {

    @Autowired private RessourceRepository ressourceRepository;
    @Autowired private SectionCoursRepository sectionRepository;
    @Autowired private CoursRepository coursRepository;

    public Ressource creer(Ressource ressource, Integer idSection, Integer idCours) {
        SectionCours section = sectionRepository.findById(idSection)
                .orElseThrow(() -> new RuntimeException("Section introuvable !"));
        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new RuntimeException("Cours introuvable !"));
        ressource.setSection(section);
        ressource.setCours(cours);
        return ressourceRepository.save(ressource);
    }

    public List<Ressource> listerParCours(Integer idCours) {
        return ressourceRepository.findByCoursIdCoursOrderByOrdreAsc(idCours);
    }

    public List<Ressource> listerParSection(Integer idSection) {
        return ressourceRepository.findBySectionIdSectionOrderByOrdreAsc(idSection);
    }

    public Ressource trouverParId(Integer id) {
        return ressourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource introuvable !"));
    }

    public Ressource modifier(Integer id, Ressource modifiee) {
        Ressource ressource = trouverParId(id);
        ressource.setTitre(modifiee.getTitre());
        ressource.setDescription(modifiee.getDescription());
        ressource.setTypeRessource(modifiee.getTypeRessource());
        ressource.setUrl(modifiee.getUrl());
        ressource.setNomFichier(modifiee.getNomFichier());
        ressource.setDuree(modifiee.getDuree());
        ressource.setEstGratuit(modifiee.getEstGratuit());
        ressource.setOrdre(modifiee.getOrdre());
        return ressourceRepository.save(ressource);
    }

    public void supprimer(Integer id) {
        if (!ressourceRepository.existsById(id))
            throw new RuntimeException("Ressource introuvable !");
        ressourceRepository.deleteById(id);
    }
}
