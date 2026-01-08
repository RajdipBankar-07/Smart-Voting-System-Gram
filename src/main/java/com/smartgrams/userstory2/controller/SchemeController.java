package com.smartgrams.userstory2.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartgrams.userstory2.entity.CitizenScheme;
import com.smartgrams.userstory2.entity.Scheme;
import com.smartgrams.userstory2.service.CitizenSchemeService;
import com.smartgrams.userstory2.service.SchemeService;

@RestController
@RequestMapping("/api/schemes")
@CrossOrigin("*") // Allow frontend access if needed
public class SchemeController {

    private final SchemeService schemeService;
    private final CitizenSchemeService citizenSchemeService;

    public SchemeController(SchemeService schemeService, CitizenSchemeService citizenSchemeService) {
        this.schemeService = schemeService;
        this.citizenSchemeService = citizenSchemeService;
    }

    // Scheme Management
    @PostMapping
    public ResponseEntity<Scheme> addScheme(@RequestBody Scheme scheme) {
        return ResponseEntity.ok(schemeService.addScheme(scheme));
    }

    @GetMapping
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    // Citizen Application
    @PostMapping("/apply")
    public ResponseEntity<CitizenScheme> applyScheme(@RequestParam Long citizenId, @RequestParam Long schemeId) {
        return ResponseEntity.ok(citizenSchemeService.applyScheme(citizenId, schemeId));
    }

    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<List<CitizenScheme>> getCitizenSchemes(@PathVariable Long citizenId) {
        return ResponseEntity.ok(citizenSchemeService.getCitizenSchemes(citizenId));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<CitizenScheme> approveScheme(@PathVariable Long id) {
        return ResponseEntity.ok(citizenSchemeService.approveScheme(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<CitizenScheme> rejectScheme(@PathVariable Long id) {
        return ResponseEntity.ok(citizenSchemeService.rejectScheme(id));
    }
}
