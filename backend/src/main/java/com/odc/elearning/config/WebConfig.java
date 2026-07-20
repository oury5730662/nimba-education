package com.odc.elearning.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

// ================================================================
// WebConfig — Sert les fichiers du dossier /uploads publiquement
// Ex: GET /uploads/covers/xxx.jpg → {app.upload.dir}/covers/xxx.jpg
// ================================================================

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String cheminAbsolu = Paths.get(uploadDir)
            .toAbsolutePath()
            .normalize()
            .toUri()
            .toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(cheminAbsolu);
    }
}
