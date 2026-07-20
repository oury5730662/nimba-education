// ================================================================
// FICHIER : CoursRepository.java
// ================================================================
package com.odc.elearning.repository;

import com.odc.elearning.entity.Cours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Integer> {

    // Trouver tous les cours d'un formateur
    List<Cours> findByFormateurIdUtilisateur(Integer idFormateur);

    // Trouver tous les cours publiés
    List<Cours> findByEstPublieTrue();

    // Compter les cours publiés (statistiques admin)
    long countByEstPublieTrue();

    // Trouver les cours par catégorie
    List<Cours> findByCategorieIdCategorie(Integer idCategorie);

    // Trouver les cours par niveau
    List<Cours> findByNiveau(Cours.Niveau niveau);
}
