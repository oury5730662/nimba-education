// ================================================================
// FICHIER : SectionCoursRepository.java
// ================================================================
package com.odc.elearning.repository;

import com.odc.elearning.entity.SectionCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SectionCoursRepository extends JpaRepository<SectionCours, Integer> {

    // Trouver toutes les sections d'un cours, triées par ordre
    List<SectionCours> findByCoursIdCoursOrderByOrdreAsc(Integer idCours);
}
