package com.kodexis.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class KodexisApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(KodexisApplication.class, args);
    }

    private static void loadDotEnv() {
        File envFile = findEnvFile();
        if (envFile != null && envFile.exists()) {
            System.out.println("[KODEXIS] Loading environment from " + envFile.getAbsolutePath());
            try {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        System.setProperty(key, value);
                    }
                }
            } catch (Exception e) {
                System.err.println("[KODEXIS] Failed to load .env file: " + e.getMessage());
            }
        } else {
            System.out.println("[KODEXIS] .env file not found. Relying on system environment variables.");
        }
    }

    private static File findEnvFile() {
        String[] paths = {".env", "../.env", "../../.env"};
        for (String p : paths) {
            File f = new File(p);
            if (f.exists() && f.isFile()) {
                return f;
            }
        }
        return null;
    }
}
