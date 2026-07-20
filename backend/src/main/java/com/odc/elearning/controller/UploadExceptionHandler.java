package com.odc.elearning.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

// ================================================================
// UploadExceptionHandler — Message clair quand le fichier dépasse
// la limite du serveur (sinon Spring renvoie une erreur 500)
// ================================================================

@RestControllerAdvice
public class UploadExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> tailleDepassee(MaxUploadSizeExceededException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("erreur", "Fichier trop volumineux pour être envoyé au serveur !"));
    }
}
