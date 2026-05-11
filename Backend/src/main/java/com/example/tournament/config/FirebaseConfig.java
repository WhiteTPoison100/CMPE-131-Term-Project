package com.example.tournament.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    /**
     * Raw JSON content of the Firebase service-account file.
     * Set via the FIREBASE_SERVICE_ACCOUNT_JSON environment variable on
     * platforms (e.g. DigitalOcean App Platform) that don't support file mounts.
     * Takes priority over service-account-path when non-blank.
     */
    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    /**
     * Absolute path to the service-account JSON file on disk.
     * Used for local development and Docker deployments where a file can be
     * mounted or baked into the image.
     */
    @Value("${firebase.service-account-path:}")
    private String serviceAccountPath;

    @PostConstruct
    public void init() {
        if (!FirebaseApp.getApps().isEmpty()) return;

        // Priority 1: JSON content supplied as an env var string (raw JSON or base64-encoded)
        if (serviceAccountJson != null && !serviceAccountJson.isBlank()) {
            try {
                String trimmed = serviceAccountJson.trim();
                // Auto-detect: raw JSON starts with '{', anything else is treated as base64
                byte[] bytes = trimmed.startsWith("{")
                        ? trimmed.getBytes(StandardCharsets.UTF_8)
                        : Base64.getDecoder().decode(trimmed);
                try (InputStream stream = new ByteArrayInputStream(bytes)) {
                    initFromStream(stream, "env var FIREBASE_SERVICE_ACCOUNT_JSON");
                }
            } catch (Exception e) {
                log.error("Failed to initialize Firebase from JSON env var: {}", e.getMessage());
            }
            return;
        }

        // Priority 2: file path on disk (local dev / Docker image)
        if (serviceAccountPath != null && !serviceAccountPath.isBlank()) {
            try (InputStream stream = new FileInputStream(serviceAccountPath)) {
                initFromStream(stream, serviceAccountPath);
            } catch (IOException e) {
                log.error("Failed to initialize Firebase from path {}: {}", serviceAccountPath, e.getMessage());
            }
            return;
        }

        // Priority 3: neither set — run in demo-only mode (Firebase auth disabled)
        log.info("No Firebase credentials configured — running in demo-only mode (Firebase auth disabled)");
    }

    private void initFromStream(InputStream stream, String source) throws IOException {
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(stream))
                .build();
        FirebaseApp.initializeApp(options);
        log.info("Firebase Admin SDK initialized from {}", source);
    }

    public boolean isEnabled() {
        return !FirebaseApp.getApps().isEmpty();
    }
}
