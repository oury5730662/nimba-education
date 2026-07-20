package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// ================================================================
// CertificatService
//
// Un certificat n'est délivré (PDF généré, téléchargeable) qu'après :
//  1) que l'apprenant remplisse les deux conditions automatiques
//     (progression >= 80%, quiz final >= 75/100)
//  2) qu'il en fasse la demande (statut "en_attente")
//  3) que le FORMATEUR du cours concerné valide manuellement cette
//     demande (statut "valide") ou la refuse (statut "refuse")
// ================================================================

@Service
public class CertificatService {

    @Autowired private CertificatRepository certificatRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private CoursRepository coursRepository;
    @Autowired private ProgressionService progressionService;
    @Autowired private QuizRepository quizRepository;
    @Autowired private TentativeQuizRepository tentativeQuizRepository;
    @Autowired private CertificatPdfService certificatPdfService;

    // Règle métier pour l'obtention d'un certificat
    private static final double SEUIL_PROGRESSION      = 80.0;  // % de ressources terminées
    private static final double SEUIL_NOTE_QUIZ_FINAL   = 75.0;  // note /100 au quiz final

    // Demander un certificat (crée une demande "en_attente" si les deux
    // conditions automatiques sont remplies ; ne génère PAS encore le PDF)
    public Certificat generer(Integer idUtilisateur, Integer idCours) {
        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new RuntimeException("Cours introuvable !"));
        if (!cours.getEstCertifiant()) {
            throw new RuntimeException("Ce cours ne délivre pas de certificat !");
        }

        // Condition 1 : au moins 80% du cours suivi
        double progression = progressionService.calculerPourcentageGlobal(idUtilisateur, idCours);
        if (progression < SEUIL_PROGRESSION) {
            throw new RuntimeException(String.format(
                    "Vous devez avoir suivi au moins %.0f%% du cours pour demander le certificat " +
                    "(progression actuelle : %.0f%%) !",
                    SEUIL_PROGRESSION, progression));
        }

        // Condition 2 : quiz final réussi avec au moins 75/100
        BigDecimal meilleureNote = meilleureNoteQuizFinal(idCours, idUtilisateur);
        if (meilleureNote == null) {
            throw new RuntimeException(
                    "Vous devez passer le quiz final d'évaluation de ce cours (note minimale requise : "
                    + (int) SEUIL_NOTE_QUIZ_FINAL + "/100) pour demander le certificat !");
        }
        if (meilleureNote.doubleValue() < SEUIL_NOTE_QUIZ_FINAL) {
            throw new RuntimeException(String.format(
                    "Votre meilleure note au quiz final est de %.0f/100 : il faut au moins %.0f/100 " +
                    "pour demander le certificat !",
                    meilleureNote.doubleValue(), SEUIL_NOTE_QUIZ_FINAL));
        }

        Optional<Certificat> existant = certificatRepository
                .findByUtilisateurIdUtilisateurAndCoursIdCours(idUtilisateur, idCours);

        if (existant.isPresent()) {
            Certificat certificat = existant.get();
            if (certificat.getStatutValidation() == Certificat.StatutValidation.valide) {
                throw new RuntimeException("Certificat déjà émis pour ce cours !");
            }
            if (certificat.getStatutValidation() == Certificat.StatutValidation.en_attente) {
                throw new RuntimeException(
                        "Votre demande de certificat est déjà en attente de validation par le formateur !");
            }
            // Précédemment refusée : on autorise une nouvelle demande
            certificat.setStatutValidation(Certificat.StatutValidation.en_attente);
            certificat.setCommentaireValidation(null);
            certificat.setDateValidation(null);
            certificat.setScoreFinal(meilleureNote);
            return certificatRepository.save(certificat);
        }

        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        String numero = String.format("NIMBA-%d-%05d",
                java.time.Year.now().getValue(), idUtilisateur * 1000 + idCours);

        Certificat certificat = new Certificat();
        certificat.setNumeroCertificat(numero);
        certificat.setUtilisateur(utilisateur);
        certificat.setCours(cours);
        certificat.setScoreFinal(meilleureNote);
        certificat.setEstValide(false);
        certificat.setStatutValidation(Certificat.StatutValidation.en_attente);

        return certificatRepository.save(certificat);
    }

    // Liste des demandes en attente pour les cours d'un formateur donné
    public List<Certificat> certificatsEnAttente(Integer idFormateur) {
        return certificatRepository.findByCoursFormateurIdUtilisateurAndStatutValidation(
                idFormateur, Certificat.StatutValidation.en_attente);
    }

    // Le formateur valide la demande : le PDF est généré à ce moment-là
    public Certificat valider(Integer idCertificat, Integer idFormateur) {
        Certificat certificat = certificatRepository.findById(idCertificat)
                .orElseThrow(() -> new RuntimeException("Certificat introuvable !"));
        verifierProprietaire(certificat, idFormateur);
        if (certificat.getStatutValidation() != Certificat.StatutValidation.en_attente) {
            throw new RuntimeException("Cette demande a déjà été traitée !");
        }

        certificat.setUrlPdf(certificatPdfService.genererPdf(certificat));
        certificat.setStatutValidation(Certificat.StatutValidation.valide);
        certificat.setEstValide(true);
        certificat.setDateValidation(LocalDateTime.now());
        return certificatRepository.save(certificat);
    }

    // Le formateur refuse la demande, avec un commentaire optionnel
    public Certificat refuser(Integer idCertificat, Integer idFormateur, String commentaire) {
        Certificat certificat = certificatRepository.findById(idCertificat)
                .orElseThrow(() -> new RuntimeException("Certificat introuvable !"));
        verifierProprietaire(certificat, idFormateur);
        if (certificat.getStatutValidation() != Certificat.StatutValidation.en_attente) {
            throw new RuntimeException("Cette demande a déjà été traitée !");
        }

        certificat.setStatutValidation(Certificat.StatutValidation.refuse);
        certificat.setEstValide(false);
        certificat.setCommentaireValidation(commentaire);
        certificat.setDateValidation(LocalDateTime.now());
        return certificatRepository.save(certificat);
    }

    private void verifierProprietaire(Certificat certificat, Integer idFormateur) {
        if (!certificat.getCours().getFormateur().getIdUtilisateur().equals(idFormateur)) {
            throw new RuntimeException("Vous n'êtes pas le formateur de ce cours !");
        }
    }

    // Vérifie où en est l'apprenant vis-à-vis des deux conditions de
    // certification, sans lever d'erreur (utilisé pour l'affichage temps réel)
    public Map<String, Object> verifierEligibilite(Integer idCours, Integer idUtilisateur) {
        double pourcentage = progressionService.calculerPourcentageGlobal(idUtilisateur, idCours);
        boolean progressionOk = pourcentage >= SEUIL_PROGRESSION;

        BigDecimal meilleureNote = meilleureNoteQuizFinal(idCours, idUtilisateur);
        double note = meilleureNote != null ? meilleureNote.doubleValue() : 0.0;
        boolean quizOk = meilleureNote != null && note >= SEUIL_NOTE_QUIZ_FINAL;

        Optional<Certificat> certificatExistant = certificatRepository
                .findByUtilisateurIdUtilisateurAndCoursIdCours(idUtilisateur, idCours);

        Map<String, Object> resultat = new LinkedHashMap<>();
        resultat.put("progressionOk", progressionOk);
        resultat.put("pourcentage", pourcentage);
        resultat.put("quizOk", quizOk);
        resultat.put("meilleureNote", note);
        resultat.put("peutObtenirCertificat", progressionOk && quizOk);
        resultat.put("statutCertificat", certificatExistant
                .map(c -> c.getStatutValidation().name()).orElse(null));
        resultat.put("commentaireRefus", certificatExistant
                .filter(c -> c.getStatutValidation() == Certificat.StatutValidation.refuse)
                .map(Certificat::getCommentaireValidation).orElse(null));
        return resultat;
    }

    // Meilleure note obtenue par l'utilisateur au(x) quiz marqué(s) comme
    // "quiz final" de ce cours (null si aucune tentative)
    private BigDecimal meilleureNoteQuizFinal(Integer idCours, Integer idUtilisateur) {
        List<Quiz> quizzesFinaux = quizRepository.findByCoursIdCoursAndEstQuizFinalTrue(idCours);

        BigDecimal meilleure = null;
        for (Quiz quiz : quizzesFinaux) {
            BigDecimal score = tentativeQuizRepository
                    .findTopByUtilisateurIdUtilisateurAndQuizIdQuizOrderByScoreObtenuDesc(
                            idUtilisateur, quiz.getIdQuiz())
                    .map(TentativeQuiz::getScoreObtenu)
                    .orElse(null);
            if (score != null && (meilleure == null || score.compareTo(meilleure) > 0)) {
                meilleure = score;
            }
        }
        return meilleure;
    }

    public List<Certificat> mesCertificats(Integer idUtilisateur) {
        return certificatRepository.findByUtilisateurIdUtilisateur(idUtilisateur);
    }

    public Certificat verifier(String numero) {
        return certificatRepository.findByNumeroCertificat(numero)
                .orElseThrow(() -> new RuntimeException("Certificat invalide ou introuvable !"));
    }

    public void supprimer(Integer id) {
        certificatRepository.deleteById(id);
    }
}
