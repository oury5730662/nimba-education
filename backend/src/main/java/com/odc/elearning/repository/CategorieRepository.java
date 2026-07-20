// ================================================================
// FICHIER : CategorieRepository.java
// ================================================================
package com.odc.elearning.repository;

import com.odc.elearning.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Integer> {

    // Vérifier si une catégorie existe par nom
    boolean existsByNom(String nom);
}
