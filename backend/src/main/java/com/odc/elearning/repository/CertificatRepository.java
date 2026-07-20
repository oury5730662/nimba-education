package com.odc.elearning.repository;

import com.odc.elearning.entity.Certificat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificatRepository extends JpaRepository<Certificat, Integer> {
    List<Certificat> findByUtilisateurIdUtilisateur(Integer idUtilisateur);
    Optional<Certificat> findByUtilisateurIdUtilisateurAndCoursIdCours(Integer idUtilisateur, Integer idCours);
    boolean existsByUtilisateurIdUtilisateurAndCoursIdCours(Integer idUtilisateur, Integer idCours);
    Optional<Certificat> findByNumeroCertificat(String numeroCertificat);
    List<Certificat> findByCoursFormateurIdUtilisateurAndStatutValidation(
            Integer idFormateur, Certificat.StatutValidation statutValidation);

    // Compter les certificats effectivement délivrés (statistiques admin)
    long countByStatutValidation(Certificat.StatutValidation statutValidation);
}
