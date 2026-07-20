package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// ================================================================
// SectionCoursService
// ================================================================

@Service
public class SectionCoursService {

    @Autowired private SectionCoursRepository sectionRepository;
    @Autowired private CoursRepository coursRepository;

    public SectionCours creer(SectionCours section, Integer idCours) {
        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new RuntimeException("Cours introuvable !"));
        section.setCours(cours);
        return sectionRepository.save(section);
    }

    public List<SectionCours> listerParCours(Integer idCours) {
        return sectionRepository.findByCoursIdCoursOrderByOrdreAsc(idCours);
    }

    public SectionCours trouverParId(Integer id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section introuvable !"));
    }

    public SectionCours modifier(Integer id, SectionCours modifiee) {
        SectionCours section = trouverParId(id);
        section.setTitre(modifiee.getTitre());
        section.setDescription(modifiee.getDescription());
        section.setOrdre(modifiee.getOrdre());
        return sectionRepository.save(section);
    }

    public void supprimer(Integer id) {
        if (!sectionRepository.existsById(id))
            throw new RuntimeException("Section introuvable !");
        sectionRepository.deleteById(id);
    }
}
