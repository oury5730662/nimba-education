// ================================================================
// FICHIER : RessourceRepository.java
// ================================================================
package com.odc.elearning.repository;

import com.odc.elearning.entity.Ressource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RessourceRepository extends JpaRepository<Ressource, Integer> {

    // Trouver toutes les ressources d'un cours
    List<Ressource> findByCoursIdCoursOrderByOrdreAsc(Integer idCours);

    // Trouver les ressources d'une section
    List<Ressource> findBySectionIdSectionOrderByOrdreAsc(Integer idSection);

    // Trouver les ressources gratuites d'un cours
    List<Ressource> findByCoursIdCoursAndEstGratuitTrue(Integer idCours);
}
