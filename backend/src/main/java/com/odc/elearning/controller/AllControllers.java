package com.odc.elearning.controller;

import com.odc.elearning.entity.*;
import com.odc.elearning.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.*;

// ================================================================
// CategorieController — /api/categories
// ================================================================

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class CategorieController {
    @Autowired CategorieService categorieService;

    @GetMapping
    public ResponseEntity<List<Categorie>> listerTous() {
        return ResponseEntity.ok(categorieService.listerTous());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> trouverParId(@PathVariable Integer id) {
        try { return ResponseEntity.ok(categorieService.trouverParId(id)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping
    public ResponseEntity<?> creer(@RequestBody Categorie cat) {
        try { return ResponseEntity.ok(categorieService.creer(cat)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modifier(@PathVariable Integer id, @RequestBody Categorie cat) {
        try { return ResponseEntity.ok(categorieService.modifier(id, cat)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Integer id) {
        categorieService.supprimer(id);
        return ResponseEntity.ok(Map.of("message", "Supprimé"));
    }
}

// ================================================================
// SectionCoursController — /api/sections
// ================================================================

@RestController
@RequestMapping("/api/sections")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class SectionCoursController {
    @Autowired SectionCoursService sectionService;

    @GetMapping("/cours/{idCours}")
    public ResponseEntity<List<SectionCours>> listerParCours(@PathVariable Integer idCours) {
        return ResponseEntity.ok(sectionService.listerParCours(idCours));
    }

    @PostMapping
    public ResponseEntity<?> creer(@RequestBody SectionCours section,
                                    @RequestParam Integer idCours) {
        try { return ResponseEntity.ok(sectionService.creer(section, idCours)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modifier(@PathVariable Integer id,
                                       @RequestBody SectionCours section) {
        try { return ResponseEntity.ok(sectionService.modifier(id, section)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Integer id) {
        sectionService.supprimer(id);
        return ResponseEntity.ok(Map.of("message", "Supprimé"));
    }
}

// ================================================================
// RessourceController — /api/ressources
// ================================================================

@RestController
@RequestMapping("/api/ressources")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class RessourceController {
    @Autowired RessourceService ressourceService;

    @GetMapping("/cours/{idCours}")
    public ResponseEntity<List<Ressource>> listerParCours(@PathVariable Integer idCours) {
        return ResponseEntity.ok(ressourceService.listerParCours(idCours));
    }

    @GetMapping("/section/{idSection}")
    public ResponseEntity<List<Ressource>> listerParSection(@PathVariable Integer idSection) {
        return ResponseEntity.ok(ressourceService.listerParSection(idSection));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> trouverParId(@PathVariable Integer id) {
        try { return ResponseEntity.ok(ressourceService.trouverParId(id)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping
    public ResponseEntity<?> creer(@RequestBody Ressource ressource,
                                    @RequestParam Integer idSection,
                                    @RequestParam Integer idCours) {
        try { return ResponseEntity.ok(ressourceService.creer(ressource, idSection, idCours)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modifier(@PathVariable Integer id,
                                       @RequestBody Ressource ressource) {
        try { return ResponseEntity.ok(ressourceService.modifier(id, ressource)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Integer id) {
        ressourceService.supprimer(id);
        return ResponseEntity.ok(Map.of("message", "Supprimé"));
    }
}

// ================================================================
// QuizController — /api/quiz
// ================================================================

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class QuizController {
    @Autowired QuizService quizService;

    @GetMapping("/cours/{idCours}")
    public ResponseEntity<List<Quiz>> listerParCours(@PathVariable Integer idCours) {
        return ResponseEntity.ok(quizService.listerParCours(idCours));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> trouverParId(@PathVariable Integer id) {
        try { return ResponseEntity.ok(quizService.trouverParId(id)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping
    public ResponseEntity<?> creerQuiz(@RequestBody Quiz quiz,
                                        @RequestParam Integer idCours,
                                        @RequestParam(required = false) Integer idSection) {
        try { return ResponseEntity.ok(quizService.creerQuiz(quiz, idCours, idSection)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @GetMapping("/{idQuiz}/questions")
    public ResponseEntity<List<Question>> listerQuestions(@PathVariable Integer idQuiz) {
        return ResponseEntity.ok(quizService.listerQuestions(idQuiz));
    }

    @PostMapping("/{idQuiz}/questions")
    public ResponseEntity<?> ajouterQuestion(@PathVariable Integer idQuiz,
                                              @RequestBody Question question) {
        try { return ResponseEntity.ok(quizService.ajouterQuestion(question, idQuiz)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @GetMapping("/questions/{idQuestion}/reponses")
    public ResponseEntity<List<Reponse>> listerReponses(@PathVariable Integer idQuestion) {
        return ResponseEntity.ok(quizService.listerReponses(idQuestion));
    }

    @PostMapping("/questions/{idQuestion}/reponses")
    public ResponseEntity<?> ajouterReponse(@PathVariable Integer idQuestion,
                                             @RequestBody Reponse reponse) {
        try { return ResponseEntity.ok(quizService.ajouterReponse(reponse, idQuestion)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @PostMapping("/{idQuiz}/soumettre")
    public ResponseEntity<?> soumettreTentative(
            @PathVariable Integer idQuiz,
            @RequestParam Integer idUtilisateur,
            @RequestBody List<ReponseApprenant> reponses) {
        try { return ResponseEntity.ok(quizService.soumettreTentative(idUtilisateur, idQuiz, reponses)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Integer id) {
        quizService.supprimerQuiz(id);
        return ResponseEntity.ok(Map.of("message", "Supprimé"));
    }
}

// ================================================================
// ProgressionController — /api/progression
// ================================================================

@RestController
@RequestMapping("/api/progression")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class ProgressionController {
    @Autowired ProgressionService progressionService;

    @PostMapping("/inscrire")
    public ResponseEntity<?> inscrire(@RequestParam Integer idUtilisateur,
                                       @RequestParam Integer idCours) {
        try { return ResponseEntity.ok(progressionService.inscrireAuCours(idUtilisateur, idCours)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @GetMapping("/mes-cours/{idUtilisateur}")
    public ResponseEntity<?> mesInscriptions(@PathVariable Integer idUtilisateur) {
        return ResponseEntity.ok(progressionService.mesInscriptions(idUtilisateur));
    }

    @PostMapping("/mettre-a-jour")
    public ResponseEntity<?> mettreAJour(
            @RequestParam Integer idUtilisateur,
            @RequestParam Integer idRessource,
            @RequestParam Integer idCours,
            @RequestParam(defaultValue = "0") Integer position,
            @RequestParam(defaultValue = "false") Boolean estComplete) {
        try {
            return ResponseEntity.ok(progressionService.mettreAJour(
                    idUtilisateur, idRessource, idCours, position, estComplete));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    @GetMapping("/cours/{idCours}/utilisateur/{idUtilisateur}")
    public ResponseEntity<?> obtenirProgression(@PathVariable Integer idCours,
                                                  @PathVariable Integer idUtilisateur) {
        double pct = progressionService.calculerPourcentageGlobal(idUtilisateur, idCours);
        List<Integer> ressourcesCompletees = progressionService
                .obtenirProgressionCours(idUtilisateur, idCours).stream()
                .filter(p -> Boolean.TRUE.equals(p.getEstComplete()))
                .map(p -> p.getRessource().getIdRessource())
                .toList();
        return ResponseEntity.ok(Map.of(
                "pourcentage", pct,
                "ressourcesCompletees", ressourcesCompletees));
    }
}

// ================================================================
// CertificatController — /api/certificats
// ================================================================

@RestController
@RequestMapping("/api/certificats")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class CertificatController {
    @Autowired CertificatService certificatService;
    @Autowired CertificatPdfService certificatPdfService;

    @PostMapping("/generer")
    public ResponseEntity<?> generer(@RequestParam Integer idUtilisateur,
                                      @RequestParam Integer idCours) {
        try { return ResponseEntity.ok(certificatService.generer(idUtilisateur, idCours)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    public ResponseEntity<?> mesCertificats(@PathVariable Integer idUtilisateur) {
        return ResponseEntity.ok(certificatService.mesCertificats(idUtilisateur));
    }

    @GetMapping("/verifier/{numero}")
    public ResponseEntity<?> verifier(@PathVariable String numero) {
        try { return ResponseEntity.ok(certificatService.verifier(numero)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @GetMapping("/eligibilite/{idCours}/{idUtilisateur}")
    public ResponseEntity<?> eligibilite(@PathVariable Integer idCours, @PathVariable Integer idUtilisateur) {
        return ResponseEntity.ok(certificatService.verifierEligibilite(idCours, idUtilisateur));
    }

    // Demandes de certificat en attente de validation, pour les cours d'un formateur
    @GetMapping("/en-attente/{idFormateur}")
    public ResponseEntity<?> certificatsEnAttente(@PathVariable Integer idFormateur) {
        return ResponseEntity.ok(certificatService.certificatsEnAttente(idFormateur));
    }

    // Le formateur valide une demande : génère le PDF et délivre le certificat
    @PatchMapping("/{id}/valider")
    public ResponseEntity<?> valider(@PathVariable Integer id, @RequestParam Integer idFormateur) {
        try { return ResponseEntity.ok(certificatService.valider(id, idFormateur)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    // Le formateur refuse une demande, avec un commentaire optionnel
    @PatchMapping("/{id}/refuser")
    public ResponseEntity<?> refuser(@PathVariable Integer id, @RequestParam Integer idFormateur,
                                      @RequestBody(required = false) Map<String, String> body) {
        try {
            String commentaire = body != null ? body.get("commentaire") : null;
            return ResponseEntity.ok(certificatService.refuser(id, idFormateur, commentaire));
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    // Téléchargement forcé (Content-Disposition: attachment), indispensable
    // car l'attribut HTML "download" est ignoré par les navigateurs pour
    // les liens cross-origin (frontend:5173 -> backend:8080)
    @GetMapping("/{numero}/telecharger")
    public ResponseEntity<?> telecharger(@PathVariable String numero) {
        try {
            Certificat certificat = certificatService.verifier(numero);
            if (certificat.getStatutValidation() != Certificat.StatutValidation.valide) {
                return ResponseEntity.badRequest().body(Map.of("erreur",
                        "Ce certificat n'est pas encore validé par le formateur !"));
            }
            byte[] contenu = certificatPdfService.lireFichier(numero);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + numero + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(contenu);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "Fichier PDF introuvable !"));
        }
    }
}

// ================================================================
// FormateurController — /api/formateurs
// ================================================================

@RestController
@RequestMapping("/api/formateurs")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class FormateurController {
    @Autowired FormateurService formateurService;

    @GetMapping("/{idUtilisateur}/profil")
    public ResponseEntity<?> obtenirProfil(@PathVariable Integer idUtilisateur) {
        try { return ResponseEntity.ok(formateurService.obtenirProfil(idUtilisateur)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping("/{idUtilisateur}/profil")
    public ResponseEntity<?> sauvegarderProfil(@PathVariable Integer idUtilisateur,
                                                 @RequestBody ProfilFormateur profil) {
        try { return ResponseEntity.ok(formateurService.sauvegarderProfil(profil, idUtilisateur)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @GetMapping("/{idFormateur}/statistiques")
    public ResponseEntity<?> obtenirStatistiques(@PathVariable Integer idFormateur) {
        return ResponseEntity.ok(formateurService.obtenirStatistiques(idFormateur));
    }

    @PostMapping("/messages")
    public ResponseEntity<?> envoyerMessage(
            @RequestParam Integer idExpediteur,
            @RequestParam Integer idDestinataire,
            @RequestBody MessageFormateur message) {
        try { return ResponseEntity.ok(formateurService.envoyerMessage(message, idExpediteur, idDestinataire)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @GetMapping("/{idUtilisateur}/messages")
    public ResponseEntity<?> mesMessages(@PathVariable Integer idUtilisateur) {
        return ResponseEntity.ok(formateurService.mesMessages(idUtilisateur));
    }

    @PatchMapping("/messages/{idMessage}/lire")
    public ResponseEntity<?> marquerLu(@PathVariable Integer idMessage) {
        try { return ResponseEntity.ok(formateurService.marquerLu(idMessage)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }
}

// ================================================================
// NotificationController — /api/notifications
// ================================================================

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
class NotificationController {
    @Autowired NotificationService notificationService;

    @GetMapping("/utilisateur/{idUtilisateur}")
    public ResponseEntity<?> mesNotifications(@PathVariable Integer idUtilisateur) {
        return ResponseEntity.ok(notificationService.mesNotifications(idUtilisateur));
    }

    @GetMapping("/utilisateur/{idUtilisateur}/non-lues")
    public ResponseEntity<?> nbNonLues(@PathVariable Integer idUtilisateur) {
        return ResponseEntity.ok(Map.of("count", notificationService.nbNonLues(idUtilisateur)));
    }

    @PatchMapping("/{id}/lire")
    public ResponseEntity<?> marquerLue(@PathVariable Integer id) {
        try { return ResponseEntity.ok(notificationService.marquerLue(id)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Integer id) {
        notificationService.supprimer(id);
        return ResponseEntity.ok(Map.of("message", "Supprimé"));
    }
}
