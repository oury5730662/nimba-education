package com.odc.elearning.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import com.odc.elearning.entity.Certificat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

// ================================================================
// CertificatPdfService — génère le PDF téléchargeable d'un certificat
// et le sauvegarde dans {app.upload.dir}/certificats
// ================================================================

@Service
public class CertificatPdfService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final DateTimeFormatter FORMAT_DATE =
            DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.FRENCH);

    private static final Color VIOLET       = new Color(79, 70, 229);
    private static final Color VIOLET_CLAIR = new Color(199, 210, 254);
    private static final Color GRIS_FONCE   = new Color(31, 41, 55);
    private static final Color GRIS         = new Color(107, 114, 128);

    // Génère le PDF et retourne son URL relative (ex: /uploads/certificats/NIMBA-2026-00001.pdf)
    public String genererPdf(Certificat certificat) {
        try {
            Document document = new Document(PageSize.A4.rotate(), 50, 50, 50, 50);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // ── Cadre décoratif ──
            PdfContentByte canvas = writer.getDirectContentUnder();
            Rectangle page = document.getPageSize();
            canvas.setColorStroke(VIOLET);
            canvas.setLineWidth(3);
            canvas.rectangle(24, 24, page.getWidth() - 48, page.getHeight() - 48);
            canvas.stroke();
            canvas.setColorStroke(VIOLET_CLAIR);
            canvas.setLineWidth(1);
            canvas.rectangle(32, 32, page.getWidth() - 64, page.getHeight() - 64);
            canvas.stroke();

            Font logoFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, VIOLET);
            Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 30, GRIS_FONCE);
            Font subFont    = FontFactory.getFont(FontFactory.HELVETICA, 14, GRIS);
            Font nameFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, VIOLET);
            Font courseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, GRIS_FONCE);
            Font smallFont  = FontFactory.getFont(FontFactory.HELVETICA, 11, GRIS);

            document.add(paragraphe("NIMBA EDUCATION", logoFont, 40, 0));
            document.add(paragraphe("CERTIFICAT DE RÉUSSITE", titleFont, 20, 0));
            document.add(paragraphe("Ceci certifie que", subFont, 10, 0));
            document.add(paragraphe(
                    certificat.getUtilisateur().getPrenom() + " " + certificat.getUtilisateur().getNom(),
                    nameFont, 20, 0));
            document.add(paragraphe("a suivi avec succès le cours", subFont, 10, 0));
            document.add(paragraphe(certificat.getCours().getTitre(), courseFont, 40, 0));

            String dateStr = certificat.getDateEmission() != null
                    ? certificat.getDateEmission().format(FORMAT_DATE) : "";
            document.add(paragraphe("Délivré le " + dateStr, subFont, 10, 0));
            document.add(paragraphe("N° de certificat : " + certificat.getNumeroCertificat(), smallFont, 0, 0));
            document.add(paragraphe(
                    "Vérifiez l'authenticité de ce certificat sur Nimba Education, onglet « Vérifier un certificat »",
                    smallFont, 30, 0));

            document.close();

            Path dossier = Paths.get(uploadDir, "certificats").toAbsolutePath().normalize();
            Files.createDirectories(dossier);
            Path fichier = dossier.resolve(certificat.getNumeroCertificat() + ".pdf");
            Files.write(fichier, baos.toByteArray());

            return "/uploads/certificats/" + certificat.getNumeroCertificat() + ".pdf";

        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF du certificat : " + e.getMessage());
        }
    }

    // Relit les octets d'un PDF de certificat déjà généré (pour le téléchargement forcé)
    public byte[] lireFichier(String numeroCertificat) throws IOException {
        Path fichier = Paths.get(uploadDir, "certificats", numeroCertificat + ".pdf")
                .toAbsolutePath().normalize();
        if (!Files.exists(fichier)) {
            throw new IOException("Fichier PDF introuvable pour le certificat " + numeroCertificat);
        }
        return Files.readAllBytes(fichier);
    }

    private Paragraph paragraphe(String texte, Font font, float espaceApres, float espaceAvant) {
        Paragraph p = new Paragraph(texte, font);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(espaceApres);
        p.setSpacingBefore(espaceAvant);
        return p;
    }
}
