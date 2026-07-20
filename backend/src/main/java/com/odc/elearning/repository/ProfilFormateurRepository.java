package com.odc.elearning.repository;

import com.odc.elearning.entity.ProfilFormateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProfilFormateurRepository extends JpaRepository<ProfilFormateur, Integer> {
    Optional<ProfilFormateur> findByUtilisateurIdUtilisateur(Integer idUtilisateur);
    boolean existsByUtilisateurIdUtilisateur(Integer idUtilisateur);
}
