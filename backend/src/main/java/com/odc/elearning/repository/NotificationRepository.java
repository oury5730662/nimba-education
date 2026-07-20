package com.odc.elearning.repository;

import com.odc.elearning.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUtilisateurIdUtilisateurOrderByDateCreationDesc(Integer idUtilisateur);
    List<Notification> findByUtilisateurIdUtilisateurAndEstLueFalse(Integer idUtilisateur);
    long countByUtilisateurIdUtilisateurAndEstLueFalse(Integer idUtilisateur);
}
