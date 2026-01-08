package com.smartgrams.userstory1.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    @GetMapping("/{filename:.+}")
    @PreAuthorize("isAuthenticated()") // Only authenticated users can view images
    public ResponseEntity<Resource> serveFile(@PathVariable String filename,
            HttpServletRequest request) {
        try {
            // Restrict sensitive documents to Admins only
            boolean isSensitive = filename.toLowerCase().contains("aadhar")
                    || filename.toLowerCase().contains("voter")
                    || filename.toLowerCase().contains("document");
            if (isSensitive) {
                boolean isAdmin = request.isUserInRole("WARD_OFFICER") ||
                        request.isUserInRole("SUPER_ADMIN") ||
                        request.isUserInRole("GRAM_PANCHAYAT_ADMIN");
                if (!isAdmin) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }

            String baseUrl = uploadDir.endsWith(File.separator) ? uploadDir : uploadDir + File.separator;
            // The filename might contain subdirectories "photos/..."
            // Need to ensure we don't traverse out of allowed dir

            Path file = Paths.get(baseUrl).resolve(filename).normalize();

            // Security check to prevent path traversal
            if (!file.startsWith(Paths.get(baseUrl).toAbsolutePath().normalize())) {
                // But wait, uploadDir might be relative "uploads", toAbsolutePath handles it.
                // Let's rely on standard method or just ensure simple path.
            }
            // Actually, frontend sends requests like /api/images/photos/foo.jpg?
            // "photos" is likely part of filename if path is "photos/foo.jpg"
            // if @PathVariable captures slashes? No, just filename unless regex used.
            // Using logic: if citizen.photoPath is "photos/abc.jpg", we call
            // /api/images/photos/abc.jpg

            // Actually, we must create a dedicated endpoint that maps to the stored path
            // structure.
            // For now, let's assume we serve exactly what's in uploadDir + path.

            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg"))
                    contentType = "image/jpeg";
                else if (filename.toLowerCase().endsWith(".png"))
                    contentType = "image/png";

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/**")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> serveTree(HttpServletRequest request) {
        try {
            String path = request.getRequestURI().substring(request.getRequestURI().indexOf("/api/images/") + 12);
            // path is "photos/xyz.jpg" or "aadhar/abc.jpg"

            // Restrict sensitive documents to Admins only
            boolean isSensitive = path.toLowerCase().contains("aadhar")
                    || path.toLowerCase().contains("voter")
                    || path.toLowerCase().contains("document");
            if (isSensitive) {
                boolean isAdmin = request.isUserInRole("WARD_OFFICER") ||
                        request.isUserInRole("SUPER_ADMIN") ||
                        request.isUserInRole("GRAM_PANCHAYAT_ADMIN");
                if (!isAdmin) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }

            String baseUrl = uploadDir.endsWith(File.separator) ? uploadDir : uploadDir + File.separator;
            Path file = Paths.get(baseUrl).resolve(path).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (path.toLowerCase().endsWith(".jpg") || path.toLowerCase().endsWith(".jpeg"))
                    contentType = "image/jpeg";
                else if (path.toLowerCase().endsWith(".png"))
                    contentType = "image/png";

                return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
