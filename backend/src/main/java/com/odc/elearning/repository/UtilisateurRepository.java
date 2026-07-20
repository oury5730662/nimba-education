// ================================================================
// FICHIER 1 : UtilisateurRepository.java
// ================================================================
package com.odc.elearning.repository;

import com.odc.elearning.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {

    // Trouver un utilisateur par email (pour la connexion)
    Optional<Utilisateur> findByEmail(String email);

    // Vérifier si un email existe déjà (pour l'inscription)
    boolean existsByEmail(String email);

    // Trouver tous les utilisateurs d'un rôle donné (espace admin)
    List<Utilisateur> findByRole(Utilisateur.Role role);

    // Compter les utilisateurs d'un rôle donné (statistiques admin)
    long countByRole(Utilisateur.Role role);
}
