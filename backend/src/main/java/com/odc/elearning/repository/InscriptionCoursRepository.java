package com.odc.elearning.repository;

import com.odc.elearning.entity.InscriptionCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionCoursRepository extends JpaRepository<InscriptionCours, Integer> {
    List<InscriptionCours> findByUtilisateurIdUtilisateur(Integer idUtilisateur);
    List<InscriptionCours> findByCoursIdCours(Integer idCours);
    Optional<InscriptionCours> findByUtilisateurIdUtilisateurAndCoursIdCours(Integer idUtilisateur, Integer idCours);
    boolean existsByUtilisateurIdUtilisateurAndCoursIdCours(Integer idUtilisateur, Integer idCours);
    long countByCoursIdCours(Integer idCours);
}
