package com.smartgrams.userstory1.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartgrams.userstory1.entity.Citizen;
import com.smartgrams.userstory1.service.CitizenService;

import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/citizens")
public class CitizenController {

    private final CitizenService citizenService;
    private final ObjectMapper objectMapper;

    public CitizenController(CitizenService citizenService, ObjectMapper objectMapper) {
        this.citizenService = citizenService;
        this.objectMapper = objectMapper;
    }

    /**
     * JSON-only creation. JSON must include photoPath that points to a file on
     * disk.
     */
    @GetMapping
    public List<Citizen> getAllCitizens() {
        return citizenService.getAllCitizens();
    }

    @PostMapping
    public Citizen createCitizen(@RequestBody Citizen citizen) {
        return citizenService.createCitizen(citizen);
    }

    /**
     * JSON-only creation. JSON must include photoPath that points to a file on
     * disk.
     */
    @PostMapping("/ward/{wardNumber}")
    public Citizen createCitizenJson(@PathVariable Integer wardNumber, @RequestBody Citizen citizen) {
        return citizenService.createCitizenJson(citizen, wardNumber);
    }

    /**
     * Multipart creation (optional). Use this if you prefer to upload the file with
     * request.
     * - citizen: JSON part (application/json)
     * - photo: file part
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Citizen> createCitizenMultipart(
            @RequestParam("citizen") String citizenJson,
            @RequestParam("wardNumber") Integer wardNumber,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("aadharCard") MultipartFile aadharCard,
            @RequestParam("voterIdCard") MultipartFile voterIdCard) {
        try {
            Citizen citizen = objectMapper.readValue(citizenJson, Citizen.class);
            return ResponseEntity
                    .ok(citizenService.createCitizenMultipart(citizen, wardNumber, photo, aadharCard, voterIdCard));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse citizen JSON or save data: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Citizen getCitizen(@PathVariable Long id) {
        return citizenService.getCitizen(id);
    }

    @GetMapping("/ward/{wardNumber}")
    public List<Citizen> getCitizensByWard(@PathVariable Integer wardNumber) {
        return citizenService.getCitizensByWard(wardNumber);
    }

    @PutMapping("/{id}")
    public Citizen updateCitizen(@PathVariable Long id, @RequestBody Citizen citizen) {
        return citizenService.updateCitizen(id, citizen);
    }

    @PostMapping(value = "/update-full/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Citizen> updateCitizenMultipart(
            @PathVariable Long id,
            @RequestParam("citizen") String citizenJson,
            @RequestParam(value = "wardNumber", required = false) Integer wardNumber,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "aadharCard", required = false) MultipartFile aadharCard,
            @RequestParam(value = "voterIdCard", required = false) MultipartFile voterIdCard) {
        try {
            Citizen citizen = objectMapper.readValue(citizenJson, Citizen.class);
            return ResponseEntity
                    .ok(citizenService.updateCitizenMultipart(id, citizen, wardNumber, photo, aadharCard, voterIdCard));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse citizen JSON or update data: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/update-by-name/{fullName}")
    public Citizen updateCitizenByName(@PathVariable Long id, @PathVariable String fullName,
            @RequestBody Citizen citizen) {
        return citizenService.updateCitizenByIdAndName(id, fullName.trim(), citizen, null);
    }

    /**
     * Update citizen data and optionally replace the photo in a single request.
     * - citizen: JSON part (application/json)
     * - photo: file part (optional)
     */
    @PutMapping(value = "/{id}/update-by-name/{fullName}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Citizen updateCitizenByNameWithPhoto(
            @PathVariable Long id,
            @PathVariable String fullName,
            @RequestPart("citizen") Citizen citizen,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        return citizenService.updateCitizenByIdAndName(id, fullName.trim(), citizen, photo);
    }

    /**
     * Upload or replace photo for an existing citizen.
     * Form field: photo (file)
     */
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Citizen uploadPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        return citizenService.uploadCitizenPhoto(id, photo);
    }

    @PostMapping(value = "/{id}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Citizen updateProfile(
            @PathVariable Long id,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "mobileNumber", required = false) String mobileNumber,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "aadharCard", required = false) MultipartFile aadharCard) {

        return citizenService.updateMyProfile(id, address, mobileNumber, photo, aadharCard);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteCitizen(@PathVariable Long id) {
        return citizenService.deleteCitizen(id);
    }

    @PostMapping("/bulk-upload")
    public Map<String, Object> uploadCitizens(@RequestParam("file") MultipartFile file) {
        return citizenService.bulkUploadCitizens(file);
    }

    @PostMapping("/{id}/verify")
    public Citizen verifyCitizen(@PathVariable Long id, @RequestParam boolean approved,
            @RequestParam(required = false) String comments) {
        return citizenService.verifyCitizen(id, approved, comments);
    }
}
