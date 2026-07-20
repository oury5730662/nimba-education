package com.odc.elearning.repository;

import com.odc.elearning.entity.MessageFormateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageFormateurRepository extends JpaRepository<MessageFormateur, Integer> {
    List<MessageFormateur> findByDestinataireIdUtilisateurOrderByDateEnvoiDesc(Integer idDestinataire);
    List<MessageFormateur> findByExpediteurIdUtilisateurOrderByDateEnvoiDesc(Integer idExpediteur);
    List<MessageFormateur> findByDestinataireIdUtilisateurAndEstLuFalse(Integer idDestinataire);
    long countByDestinataireIdUtilisateurAndEstLuFalse(Integer idDestinataire);
}
