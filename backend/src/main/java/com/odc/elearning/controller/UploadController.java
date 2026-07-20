package com.odc.elearning.controller;

import com.odc.elearning.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

// ================================================================
// UploadController — /api/upload
// Réception des fichiers uploadés (multipart/form-data)
// ================================================================

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UploadController {

    @Autowired private FileStorageService fileStorageService;

    private static final List<String> DOSSIERS_IMAGE_AUTORISES = List.of("covers", "profils");

    // POST /api/upload/image — Upload d'une image (jpg, jpeg, png, webp, max 5 Mo)
    // dossier optionnel : "covers" (défaut, images de cours) ou "profils" (photos de profil)
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                          @RequestParam(required = false, defaultValue = "covers") String dossier) {
        try {
            String dossierValide = DOSSIERS_IMAGE_AUTORISES.contains(dossier) ? dossier : "covers";
            String url = fileStorageService.sauvegarderImage(file, dossierValide);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // POST /api/upload/video — Upload d'une vidéo (mp4, webm, ogg, mov, max 200 Mo)
    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.sauvegarderVideo(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    // POST /api/upload/document — Upload d'un document (pdf, doc, ppt, xls..., max 20 Mo)
    @PostMapping("/document")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.sauvegarderDocument(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }
}
