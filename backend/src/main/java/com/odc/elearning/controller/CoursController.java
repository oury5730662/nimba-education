package com.odc.elearning.controller;

import com.odc.elearning.entity.Cours;
import com.odc.elearning.service.CoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

// ================================================================
// CoursController — /api/cours
// ================================================================

@RestController
@RequestMapping("/api/cours")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CoursController {

    @Autowired private CoursService coursService;

    // GET /api/cours — Tous les cours
    @GetMapping
    public ResponseEntity<List<Cours>> listerTous() {
        return ResponseEntity.ok(coursService.listerTous());
    }

    // GET /api/cours/publies — Cours publiés (public)
    @GetMapping("/publies")
    public ResponseEntity<List<Cours>> listerPublies() {
        return ResponseEntity.ok(coursService.listerPublies());
    }

    // GET /api/cours/formateur/{id} — Cours d'un formateur
    @GetMapping("/formateur/{idFormateur}")
    public ResponseEntity<List<Cours>> listerParFormateur(@PathVariable Integer idFormateur) {
        return ResponseEntity.ok(coursService.listerParFormateur(idFormateur));
    }

    // GET /api/cours/{id} — Un cours par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> trouverParId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(coursService.trouverParId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/cours — Créer un cours
    @PostMapping
    public ResponseEntity<?> creer(
            @RequestBody Cours cours,
            @RequestParam Integer idFormateur,
            @RequestParam(required = false) Integer idCategorie) {
        try {
            return ResponseEntity.ok(coursService.creer(cours, idFormateur, idCategorie));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // PUT /api/cours/{id} — Modifier un cours
    @PutMapping("/{id}")
    public ResponseEntity<?> modifier(
            @PathVariable Integer id,
            @RequestBody Cours cours,
            @RequestParam(required = false) Integer idCategorie) {
        try {
            return ResponseEntity.ok(coursService.modifier(id, cours, idCategorie));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // PATCH /api/cours/{id}/publication — Publier/Dépublier
    @PatchMapping("/{id}/publication")
    public ResponseEntity<?> togglePublication(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(coursService.togglePublication(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // DELETE /api/cours/{id} — Supprimer un cours
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimer(
            @PathVariable Integer id,
            @RequestParam Integer idFormateur) {
        try {
            coursService.supprimer(id, idFormateur);
            return ResponseEntity.ok(Map.of("message", "Cours supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }
}
