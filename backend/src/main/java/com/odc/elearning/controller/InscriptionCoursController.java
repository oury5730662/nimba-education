package com.odc.elearning.controller;

import com.odc.elearning.dto.ApprenantInscritResponse;
import com.odc.elearning.entity.InscriptionCours;
import com.odc.elearning.repository.InscriptionCoursRepository;
import com.odc.elearning.service.ProgressionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

// ================================================================
// InscriptionCoursController — /api/inscriptions
// ================================================================

@RestController
@RequestMapping("/api/inscriptions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class InscriptionCoursController {

    @Autowired private InscriptionCoursRepository inscriptionRepository;
    @Autowired private ProgressionService progressionService;

    // GET /api/inscriptions/cours/{idCours} — Apprenants inscrits à un cours
    @GetMapping("/cours/{idCours}")
    public ResponseEntity<List<ApprenantInscritResponse>> listerParCours(@PathVariable Integer idCours) {
        List<InscriptionCours> inscriptions = inscriptionRepository.findByCoursIdCours(idCours);

        List<ApprenantInscritResponse> resultat = inscriptions.stream()
                .map(i -> new ApprenantInscritResponse(
                        i.getUtilisateur().getIdUtilisateur(),
                        i.getUtilisateur().getNom(),
                        i.getUtilisateur().getPrenom(),
                        i.getUtilisateur().getEmail(),
                        i.getDateInscription(),
                        i.getStatut().name(),
                        progressionService.calculerPourcentageGlobal(
                                i.getUtilisateur().getIdUtilisateur(), idCours)
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resultat);
    }
}
