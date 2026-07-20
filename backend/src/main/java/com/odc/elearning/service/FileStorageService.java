package com.odc.elearning.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

// ================================================================
// FileStorageService — Sauvegarde des fichiers uploadés
// Images  -> {app.upload.dir}/covers
// Vidéos  -> {app.upload.dir}/videos
// Documents (pdf, doc, ppt, xls...) -> {app.upload.dir}/documents
// ================================================================

@Service
public class FileStorageService {

    private static final List<String> EXT_IMAGE =
        List.of("jpg", "jpeg", "png", "webp");
    private static final List<String> EXT_VIDEO =
        List.of("mp4", "webm", "ogg", "mov");
    private static final List<String> EXT_DOCUMENT =
        List.of("pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt");

    private static final long TAILLE_MAX_IMAGE    = 5L   * 1024 * 1024;  // 5 Mo
    private static final long TAILLE_MAX_VIDEO    = 200L * 1024 * 1024;  // 200 Mo
    private static final long TAILLE_MAX_DOCUMENT = 20L  * 1024 * 1024;  // 20 Mo

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String sauvegarderImage(MultipartFile fichier) {
        return sauvegarderImage(fichier, "covers");
    }

    // sousDossier : "covers" (images de cours/ressources) ou "profils"
    // (photos de profil) — validé par l'appelant (UploadController)
    public String sauvegarderImage(MultipartFile fichier, String sousDossier) {
        return sauvegarder(fichier, sousDossier, EXT_IMAGE, TAILLE_MAX_IMAGE,
            "Formats acceptés : jpg, jpeg, png, webp");
    }

    public String sauvegarderVideo(MultipartFile fichier) {
        return sauvegarder(fichier, "videos", EXT_VIDEO, TAILLE_MAX_VIDEO,
            "Formats acceptés : mp4, webm, ogg, mov");
    }

    public String sauvegarderDocument(MultipartFile fichier) {
        return sauvegarder(fichier, "documents", EXT_DOCUMENT, TAILLE_MAX_DOCUMENT,
            "Formats acceptés : pdf, doc, docx, ppt, pptx, xls, xlsx, txt");
    }

    // Sauvegarde un fichier dans le sous-dossier donné et retourne son URL relative
    // (ex: /uploads/videos/xxx.mp4)
    private String sauvegarder(MultipartFile fichier, String sousDossier,
                                List<String> extensionsAutorisees, long tailleMax,
                                String messageFormats) {

        if (fichier == null || fichier.isEmpty()) {
            throw new RuntimeException("Aucun fichier reçu !");
        }

        if (fichier.getSize() > tailleMax) {
            throw new RuntimeException(
                "Fichier trop volumineux ! Taille maximale : " + (tailleMax / (1024 * 1024)) + " Mo");
        }

        String nomOriginal = fichier.getOriginalFilename();
        String extension = "";
        if (nomOriginal != null && nomOriginal.lastIndexOf('.') != -1) {
            extension = nomOriginal
                .substring(nomOriginal.lastIndexOf('.') + 1)
                .toLowerCase();
        }

        if (!extensionsAutorisees.contains(extension)) {
            throw new RuntimeException("Format non autorisé ! " + messageFormats);
        }

        try {
            Path dossier = Paths.get(uploadDir, sousDossier).toAbsolutePath().normalize();
            Files.createDirectories(dossier);

            String nomFichier = UUID.randomUUID() + "." + extension;
            fichier.transferTo(dossier.resolve(nomFichier));

            return "/uploads/" + sousDossier + "/" + nomFichier;

        } catch (IOException e) {
            throw new RuntimeException(
                "Impossible d'enregistrer le fichier : " + e.getMessage());
        }
    }
}
