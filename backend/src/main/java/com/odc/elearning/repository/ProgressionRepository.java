package com.odc.elearning.repository;

import com.odc.elearning.entity.Progression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressionRepository extends JpaRepository<Progression, Integer> {
    List<Progression> findByUtilisateurIdUtilisateurAndCoursIdCours(Integer idUtilisateur, Integer idCours);
    Optional<Progression> findByUtilisateurIdUtilisateurAndRessourceIdRessource(Integer idUtilisateur, Integer idRessource);

    // Calculer le pourcentage global de progression d'un apprenant dans un cours
    @Query("SELECT COUNT(p) FROM Progression p WHERE p.utilisateur.idUtilisateur = :idUser AND p.cours.idCours = :idCours AND p.estComplete = true")
    long countRessourcesCompletees(@Param("idUser") Integer idUser, @Param("idCours") Integer idCours);
}
