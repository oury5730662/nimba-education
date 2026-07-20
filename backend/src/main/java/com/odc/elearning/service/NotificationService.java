package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// ================================================================
// NotificationService
// ================================================================

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    public Notification envoyer(Integer idUtilisateur, String titre,
                                 String message, Notification.TypeNotif type) {
        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        Notification notif = new Notification();
        notif.setUtilisateur(utilisateur);
        notif.setTitre(titre);
        notif.setMessage(message);
        notif.setTypeNotif(type);
        return notificationRepository.save(notif);
    }

    public List<Notification> mesNotifications(Integer idUtilisateur) {
        return notificationRepository
                .findByUtilisateurIdUtilisateurOrderByDateCreationDesc(idUtilisateur);
    }

    public long nbNonLues(Integer idUtilisateur) {
        return notificationRepository
                .countByUtilisateurIdUtilisateurAndEstLueFalse(idUtilisateur);
    }

    public Notification marquerLue(Integer idNotification) {
        Notification notif = notificationRepository.findById(idNotification)
                .orElseThrow(() -> new RuntimeException("Notification introuvable !"));
        notif.setEstLue(true);
        return notificationRepository.save(notif);
    }

    public void supprimer(Integer id) {
        notificationRepository.deleteById(id);
    }
}
