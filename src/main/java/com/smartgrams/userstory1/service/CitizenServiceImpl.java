package com.smartgrams.userstory1.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartgrams.userstory1.entity.Citizen;
import com.smartgrams.userstory1.entity.Ward;
import com.smartgrams.userstory1.repository.CitizenRepository;
import com.smartgrams.userstory1.repository.WardRepository;

@Service
@Transactional
public class CitizenServiceImpl implements CitizenService {

    private final CitizenRepository citizenRepository;
    private final WardRepository wardRepository;
    private final AuditService auditService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Base directory for uploads (from application.properties)
    private final String uploadBaseDir;

    public CitizenServiceImpl(CitizenRepository citizenRepository,
            WardRepository wardRepository,
            AuditService auditService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            @Value("${file.upload.dir:uploads}") String uploadBaseDir) {
        this.citizenRepository = citizenRepository;
        this.wardRepository = wardRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        // normalize trailing slash
        this.uploadBaseDir = uploadBaseDir.endsWith(File.separator) ? uploadBaseDir : uploadBaseDir + File.separator;
    }

    // ---------------------------
    // JSON-only creation (photoPath must exist)
    // ---------------------------
    @Override
    public List<Citizen> getAllCitizens() {
        return citizenRepository.findAll();
    }

    private void validateIdentity(Citizen citizen) {
        if (citizen.getPhotoPath() == null || citizen.getPhotoPath().trim().isEmpty()) {
            throw new RuntimeException("Identity Verification Failed: Photo is required for activation.");
        }
        if (citizen.getAadharCardPath() == null || citizen.getAadharCardPath().trim().isEmpty()) {
            throw new RuntimeException("Identity Verification Failed: Aadhar Card image is required.");
        }
        if (citizen.getVoterIdCardPath() == null || citizen.getVoterIdCardPath().trim().isEmpty()) {
            throw new RuntimeException("Identity Verification Failed: Voter ID Card image is required.");
        }
        if (citizen.getAadharNumber() == null || citizen.getAadharNumber().trim().isEmpty()) {
            throw new RuntimeException("Identity Verification Failed: Aadhar Number is required.");
        }
        if (citizen.getMobileNumber() == null || citizen.getMobileNumber().trim().isEmpty()) {
            throw new RuntimeException("Identity Verification Failed: Mobile Number is required.");
        }
    }

    @Override
    public Citizen createCitizen(Citizen citizen) {
        // For admin manual creation, we allow it to be saved even without immediate
        // photo.
        // validateIdentity(citizen); // Removing strict check here

        if (citizen.getBirthDate() != null) {
            int age = Period.between(citizen.getBirthDate(), LocalDate.now()).getYears();
            citizen.setAge(age);
        }

        if (citizen.getWard() != null && citizen.getWard().getId() != null) {
            Ward ward = wardRepository.findById(citizen.getWard().getId())
                    .orElseThrow(() -> new RuntimeException("Selected Ward not found"));
            citizen.setWard(ward);
        }
        Citizen saved = citizenRepository.save(citizen);
        auditService.log("CREATE", "Citizen", saved.getId().toString(), "Created citizen: " + saved.getFullName(),
                saved.getWard() != null ? saved.getWard().getId() : null);
        return saved;
    }

    @Override
    public Citizen createCitizenJson(Citizen citizen, Integer wardNumber) {
        if (citizen.getStatus() == com.smartgrams.userstory1.entity.CitizenStatus.ACTIVE) {
            validateIdentity(citizen);
        }

        // photoPath required in JSON
        if (citizen.getPhotoPath() == null || citizen.getPhotoPath().trim().isEmpty()) {
            throw new RuntimeException("photoPath is required in JSON and must point to an existing file.");
        }

        String providedPath = citizen.getPhotoPath().trim();
        File photoFile = new File(providedPath);

        // if not absolute/existing, try relative inside upload base dir
        if (!photoFile.exists()) {
            photoFile = new File(uploadBaseDir + providedPath);
            if (!photoFile.exists()) {
                photoFile = new File(uploadBaseDir + "photos" + File.separator + providedPath);
                if (!photoFile.exists()) {
                    throw new RuntimeException("Photo file not found: " + providedPath);
                } else {
                    citizen.setPhotoPath("photos" + File.separator + photoFile.getName());
                }
            } else {
                citizen.setPhotoPath(providedPath);
            }
        } else {
            citizen.setPhotoPath(providedPath);
        }

        // Standard validation
        if (citizen.getBirthDate() == null)
            throw new RuntimeException("Birth date is required.");
        LocalDate today = LocalDate.now();
        int age = Period.between(citizen.getBirthDate(), today).getYears();
        if (age < 18)
            throw new RuntimeException("Age must be 18+.");
        citizen.setAge(age);

        if (citizen.getAadharNumber() == null)
            throw new RuntimeException("Aadhar required.");
        if (citizenRepository.findByAadharNumber(citizen.getAadharNumber()).isPresent()) {
            throw new RuntimeException("Voter already registered in the system.");
        }

        if (citizen.getVoterId() != null && !citizen.getVoterId().isEmpty()) {
            if (citizenRepository.findByVoterId(citizen.getVoterId()).isPresent()) {
                throw new RuntimeException("Voter already registered in the system.");
            }
        }

        if (citizen.getGender() == null)
            throw new RuntimeException("Gender required.");

        // Ward Check
        Ward ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        citizen.setWard(ward);

        Citizen saved = citizenRepository.save(citizen);
        auditService.log("CREATE", "Citizen", saved.getId().toString(),
                "Created citizen via JSON: " + saved.getFullName(), saved.getWard().getId());
        return saved;
    }

    // ---------------------------
    // Multipart creation (accept file and save)
    // ---------------------------
    @Override
    public Citizen createCitizenMultipart(Citizen citizen, Integer wardNumber, MultipartFile photo,
            MultipartFile aadharCard, MultipartFile voterIdCard) {
        if (photo == null || photo.isEmpty()) {
            throw new RuntimeException("Photo is required for multipart citizen creation.");
        }
        if (aadharCard == null || aadharCard.isEmpty()) {
            throw new RuntimeException("Aadhar Card image is required.");
        }
        if (voterIdCard == null || voterIdCard.isEmpty()) {
            throw new RuntimeException("Voter ID Card image is required.");
        }

        String contentType = photo.getContentType() == null ? "" : photo.getContentType().toLowerCase();
        if (!(contentType.equals("image/jpeg") || contentType.equals("image/jpg") || contentType.equals("image/png"))) {
            throw new RuntimeException("Invalid photo type. Only JPG, JPEG, and PNG are allowed.");
        }

        // Validate JSON fields
        if (citizen.getFullName() == null || citizen.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full Name is required.");
        }

        if (citizen.getBirthDate() == null) {
            throw new RuntimeException("Date of Birth is required.");
        }
        int age = java.time.Period.between(citizen.getBirthDate(), LocalDate.now()).getYears();
        if (age < 18)
            throw new RuntimeException("Age must be 18+.");
        citizen.setAge(age);

        if (citizen.getAadharNumber() == null)
            throw new RuntimeException("Aadhaar Number is mandatory.");
        String aadhar = citizen.getAadharNumber().trim();
        if (citizenRepository.findByAadharNumber(aadhar).isPresent()) {
            throw new RuntimeException("Submission Rejected: Aadhaar Number already registered.");
        }
        citizen.setAadharNumber(aadhar);

        if (citizen.getVoterId() == null || citizen.getVoterId().trim().isEmpty()) {
            throw new RuntimeException("Voter ID Number is mandatory.");
        }
        if (citizenRepository.findByVoterId(citizen.getVoterId().trim()).isPresent()) {
            throw new RuntimeException("Submission Rejected: Voter ID Number already registered.");
        }

        if (citizen.getMobileNumber() == null)
            throw new RuntimeException("Mobile Number is mandatory.");
        if (citizenRepository.findByMobileNumber(citizen.getMobileNumber()).isPresent())
            throw new RuntimeException("Mobile Number already registered.");

        if (citizen.getGender() == null || citizen.getGender().trim().isEmpty()) {
            throw new RuntimeException("Gender is required (MALE, FEMALE, OTHER).");
        }
        citizen.setGender(citizen.getGender().trim().toUpperCase());

        // Username / Password validation
        if (citizen.getUsername() == null || citizen.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required.");
        }
        if (citizenRepository.findByUsername(citizen.getUsername().trim()).isPresent()) {
            throw new RuntimeException("Username is already taken.");
        }
        if (citizen.getPassword() == null || citizen.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required.");
        }
        citizen.setPassword(passwordEncoder.encode(citizen.getPassword().trim()));

        Ward ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        citizen.setWard(ward);

        try {
            citizen.setPhotoPath(storePhotoFile(photo));
            citizen.setAadharCardPath(storeFile(aadharCard, "aadhar"));
            citizen.setVoterIdCardPath(storeFile(voterIdCard, "voter"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to save files: " + e.getMessage());
        }

        // AUTO-SET STATUS TO PENDING_APPROVAL for public registration
        citizen.setStatus(com.smartgrams.userstory1.entity.CitizenStatus.PENDING_APPROVAL);

        Citizen saved = citizenRepository.save(citizen);
        auditService.log("CREATE", "Citizen", saved.getId().toString(),
                "Created citizen via Multipart (Pending Approval): " + saved.getFullName(),
                saved.getWard().getId());
        return saved;
    }

    @Override
    public Citizen updateCitizenMultipart(Long id, Citizen updated, Integer wardNumber, MultipartFile photo,
            MultipartFile aadharCard, MultipartFile voterIdCard) {
        Citizen existing = citizenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        if (updated.getFullName() != null)
            existing.setFullName(updated.getFullName());
        if (updated.getBirthDate() != null) {
            existing.setBirthDate(updated.getBirthDate());
            existing.setAge(java.time.Period.between(updated.getBirthDate(), LocalDate.now()).getYears());
        }
        if (updated.getAddress() != null)
            existing.setAddress(updated.getAddress());
        if (updated.getAadharNumber() != null)
            existing.setAadharNumber(updated.getAadharNumber());
        if (updated.getMobileNumber() != null)
            existing.setMobileNumber(updated.getMobileNumber());
        if (updated.getGender() != null)
            existing.setGender(updated.getGender().toUpperCase());
        if (updated.getVoterId() != null)
            existing.setVoterId(updated.getVoterId());
        if (updated.getFamilyId() != null)
            existing.setFamilyId(updated.getFamilyId());
        if (updated.getStatus() != null)
            existing.setStatus(updated.getStatus());

        if (wardNumber != null) {
            Ward ward = wardRepository.findByWardNumber(wardNumber)
                    .orElseThrow(() -> new RuntimeException("Ward not found"));
            existing.setWard(ward);
        } else if (updated.getWard() != null && updated.getWard().getId() != null) {
            Ward ward = wardRepository.findById(updated.getWard().getId())
                    .orElseThrow(() -> new RuntimeException("Ward not found"));
            existing.setWard(ward);
        }

        try {
            if (photo != null && !photo.isEmpty())
                existing.setPhotoPath(storePhotoFile(photo));
            if (aadharCard != null && !aadharCard.isEmpty())
                existing.setAadharCardPath(storeFile(aadharCard, "aadhar"));
            if (voterIdCard != null && !voterIdCard.isEmpty())
                existing.setVoterIdCardPath(storeFile(voterIdCard, "voter"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update files: " + e.getMessage());
        }

        if (existing.getStatus() == com.smartgrams.userstory1.entity.CitizenStatus.ACTIVE) {
            validateIdentity(existing);
        }

        Citizen saved = citizenRepository.save(existing);
        auditService.log("UPDATE", "Citizen", saved.getId().toString(),
                "Updated citizen via Multipart: " + saved.getFullName(),
                saved.getWard() != null ? saved.getWard().getId() : null);
        return saved;
    }

    private String storeFile(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            System.out.println("[FILE SAVE] Skipping " + subDir + " - file is empty or null");
            return null;
        }
        try {
            String dirPath = uploadBaseDir + subDir + File.separator;
            File dir = new File(dirPath);
            if (!dir.exists())
                dir.mkdirs();

            String original = file.getOriginalFilename() == null ? "file"
                    : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            String filename = "citizen_" + System.currentTimeMillis() + "_" + original;
            Path dest = Paths.get(dirPath + filename);
            Files.write(dest, file.getBytes());
            String savedPath = subDir + "/" + filename;
            System.out.println("[FILE SAVE] Saved " + subDir + " to: " + savedPath);
            return savedPath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save " + subDir + " file: " + e.getMessage());
        }
    }

    @Override
    public Citizen verifyCitizen(Long id, boolean isApproved, String remarks) {
        Citizen citizen = citizenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        if (isApproved) {
            validateIdentity(citizen); // Ensure it meets criteria
            citizen.setStatus(com.smartgrams.userstory1.entity.CitizenStatus.ACTIVE);
            auditService.log("APPROVE", "Citizen", id.toString(), "Citizen Approved by Admin. Remarks: " + remarks,
                    citizen.getWard().getId());
        } else {
            citizen.setStatus(com.smartgrams.userstory1.entity.CitizenStatus.REJECTED);
            // Optionally store remarks in entity if field exists, currently logging
            auditService.log("REJECT", "Citizen", id.toString(), "Citizen Rejected by Admin. Reason: " + remarks,
                    citizen.getWard().getId());
        }

        return citizenRepository.save(citizen);
    }

    // ---------------------------
    // Upload or replace photo for an existing citizen
    // ---------------------------
    @Override
    public Citizen uploadCitizenPhoto(Long id, MultipartFile file) {
        Citizen citizen = citizenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty.");
        }

        String relativePath = storePhotoFile(file);

        // Optionally delete old photo file if stored under uploadBaseDir
        String oldPath = citizen.getPhotoPath();
        if (oldPath != null) {
            File oldFile = new File(oldPath);
            if (!oldFile.exists()) {
                // try relative to uploadBaseDir
                oldFile = new File(uploadBaseDir + oldPath);
            }
            if (oldFile.exists()) {
                // do not delete automatically; uncomment to delete:
                // oldFile.delete();
            }
        }

        citizen.setPhotoPath(relativePath);
        return citizenRepository.save(citizen);
    }

    // ---------------------------
    // Other simple service methods
    // ---------------------------
    @Override
    public Citizen getCitizen(Long id) {
        return citizenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));
    }

    @Override
    public List<Citizen> getCitizensByWard(Integer wardNumber) {
        Ward ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        return citizenRepository.findByWard(ward);
    }

    @Override
    public Citizen updateCitizen(Long id, Citizen updated) {
        Citizen existing = citizenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        // update allowed fields
        existing.setFullName(updated.getFullName());
        existing.setAddress(updated.getAddress());
        existing.setVastiName(updated.getVastiName());
        // do not allow Aadhar change here; if required add checks
        existing.setGender(updated.getGender());
        // recalc age if birthDate provided
        if (updated.getBirthDate() != null) {
            existing.setBirthDate(updated.getBirthDate());
            int age = Period.between(updated.getBirthDate(), LocalDate.now()).getYears();
            existing.setAge(age);
        }

        // Verify identity if status is ACTIVE (or becoming ACTIVE)
        if (existing.getStatus() == com.smartgrams.userstory1.entity.CitizenStatus.ACTIVE) {
            validateIdentity(existing);
        }

        Citizen saved = citizenRepository.save(existing);
        auditService.log("UPDATE", "Citizen", saved.getId().toString(), "Updated citizen: " + saved.getFullName(),
                saved.getWard() != null ? saved.getWard().getId() : null);
        return saved;
    }

    @Override
    public Citizen updateCitizenByIdAndName(Long id, String fullName, Citizen citizen, MultipartFile photo) {
        Citizen existing = citizenRepository.findByIdAndFullNameIgnoreCase(id, fullName)
                .orElseThrow(() -> new RuntimeException("Citizen not found with given id and name"));
        // apply updates (similar to updateCitizen)
        if (citizen.getFullName() != null && !citizen.getFullName().trim().isEmpty()) {
            existing.setFullName(citizen.getFullName().trim());
        }
        if (citizen.getAddress() != null) {
            existing.setAddress(citizen.getAddress());
        }
        if (citizen.getVastiName() != null) {
            existing.setVastiName(citizen.getVastiName());
        }
        if (citizen.getGender() != null && !citizen.getGender().trim().isEmpty()) {
            existing.setGender(citizen.getGender().trim().toUpperCase());
        }
        if (citizen.getBirthDate() != null) {
            existing.setBirthDate(citizen.getBirthDate());
            int age = Period.between(citizen.getBirthDate(), LocalDate.now()).getYears();
            existing.setAge(age);
        }
        if (photo != null && !photo.isEmpty()) {
            existing.setPhotoPath(storePhotoFile(photo));
        } else if (citizen.getPhotoPath() != null && !citizen.getPhotoPath().trim().isEmpty()) {
            existing.setPhotoPath(citizen.getPhotoPath().trim());
        }
        Citizen saved = citizenRepository.save(existing);
        auditService.log("UPDATE", "Citizen", saved.getId().toString(), "Updated citizen: " + saved.getFullName(),
                saved.getWard() != null ? saved.getWard().getId() : null);
        return saved;
    }

    /**
     * Save a photo (image/pdf) under the configured upload base and return the
     * relative path.
     */
    private String storePhotoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            System.out.println("[FILE SAVE] Skipping photo - file is empty or null");
            return null;
        }
        try {
            String photosDir = uploadBaseDir + "photos" + File.separator;
            File dir = new File(photosDir);
            if (!dir.exists())
                dir.mkdirs();

            String original = file.getOriginalFilename() == null ? "photo"
                    : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            String filename = "citizen_" + System.currentTimeMillis() + "_" + original;
            Path dest = Paths.get(photosDir + filename);
            Files.write(dest, file.getBytes());
            String savedPath = "photos/" + filename;
            System.out.println("[FILE SAVE] Saved photo to: " + savedPath);
            return savedPath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save photo file: " + e.getMessage());
        }
    }

    @Override
    public Map<String, String> deleteCitizen(Long id) {
        Citizen c = citizenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        // collect details for the response before deletion
        String fullName = c.getFullName();
        Ward ward = c.getWard();
        String wardNumber = ward != null && ward.getWardNumber() != null ? ward.getWardNumber().toString() : "N/A";
        String wardName = ward != null && ward.getWardName() != null ? ward.getWardName() : "";
        Long wardId = ward != null ? ward.getId() : null;

        citizenRepository.delete(c);
        auditService.log("DELETE", "Citizen", id.toString(), "Deleted citizen: " + fullName, wardId);

        Map<String, String> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("message", "Citizen deleted");
        resp.put("citizenName", fullName);
        resp.put("wardNumber", wardNumber);
        resp.put("wardName", wardName);
        return resp;
    }

    @Override
    public Citizen updateMyProfile(Long id, String address, String mobile, MultipartFile photo,
            MultipartFile aadharCard) {
        Citizen citizen = citizenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        boolean updated = false;
        if (address != null && !address.trim().isEmpty()) {
            citizen.setAddress(address.trim());
            updated = true;
        }
        if (mobile != null && !mobile.trim().isEmpty()) {
            if (!mobile.equals(citizen.getMobileNumber())) {
                if (citizenRepository.findByMobileNumber(mobile).isPresent()) {
                    throw new RuntimeException("Mobile number already in use.");
                }
                citizen.setMobileNumber(mobile.trim());
                updated = true;
            }
        }

        if (photo != null && !photo.isEmpty()) {
            citizen.setPhotoPath(storePhotoFile(photo));
            updated = true;
        }

        if (aadharCard != null && !aadharCard.isEmpty()) {
            // Save Aadhar (Reuse explicit logic or minor duplication)
            try {
                String aadharDir = uploadBaseDir + "aadhar" + File.separator;
                File aDir = new File(aadharDir);
                if (!aDir.exists())
                    aDir.mkdirs();

                String aOriginal = aadharCard.getOriginalFilename() == null ? "aadhar"
                        : aadharCard.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_]", "_");
                String aFilename = "citizen_" + System.currentTimeMillis() + "_a_" + aOriginal;
                Path aDest = Paths.get(aadharDir + aFilename);
                Files.write(aDest, aadharCard.getBytes());
                citizen.setAadharCardPath("aadhar" + File.separator + aFilename);
                updated = true;
            } catch (IOException e) {
                throw new RuntimeException("Failed to save Aadhar Card: " + e.getMessage());
            }
        }

        if (updated) {
            // FORCE PENDING APPROVAL on any self-update
            citizen.setStatus(com.smartgrams.userstory1.entity.CitizenStatus.PENDING_APPROVAL);
            Citizen saved = citizenRepository.save(citizen);
            auditService.log("UPDATE_PROFILE", "Citizen", saved.getId().toString(),
                    "Citizen updated profile (Status -> PENDING): " + saved.getFullName(),
                    saved.getWard() != null ? saved.getWard().getId() : null);
            return saved;
        }

        return citizen;
    }

    @Override
    public Map<String, Object> bulkUploadCitizens(MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        int successCount = 0;
        int failureCount = 0;
        StringBuilder errors = new StringBuilder();

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty.");
        }

        try (java.io.BufferedReader br = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream()))) {
            String line;
            int lineNumber = 0;
            while ((line = br.readLine()) != null) {
                lineNumber++;
                if (lineNumber == 1)
                    continue; // Skip header

                String[] data = line.split(",");
                if (data.length < 7) {
                    failureCount++;
                    errors.append("Line ").append(lineNumber).append(": Insufficient data. ");
                    continue;
                }

                try {
                    // CSV Format: Full Name, DOB(YYYY-MM-DD), Address, Aadhar, Mobile, Gender, Ward
                    // Number
                    String fullName = data[0].trim();
                    String dobStr = data[1].trim();
                    String address = data[2].trim();
                    String aadhar = data[3].trim();
                    String mobile = data[4].trim();
                    String gender = data[5].trim().toUpperCase();
                    String wardNumStr = data[6].trim();

                    // Validation
                    if (fullName.isEmpty() || dobStr.isEmpty() || address.isEmpty() || aadhar.isEmpty()
                            || gender.isEmpty() || wardNumStr.isEmpty()) {
                        throw new RuntimeException("Missing required fields.");
                    }

                    // Aadhar & Mobile Uniqueness
                    if (citizenRepository.findByAadharNumber(aadhar).isPresent()) {
                        throw new RuntimeException("Aadhar duplicate.");
                    }
                    if (!mobile.isEmpty() && citizenRepository.findByMobileNumber(mobile).isPresent()) { // Assuming
                                                                                                         // findByMobileNumber
                                                                                                         // exists or
                                                                                                         // added
                        throw new RuntimeException("Mobile duplicate.");
                    }

                    // Age Validation
                    LocalDate birthDate = LocalDate.parse(dobStr);
                    int age = Period.between(birthDate, LocalDate.now()).getYears();
                    if (age < 18) {
                        throw new RuntimeException("Age must be 18+.");
                    }

                    // Ward Logic
                    Integer wardNumber = Integer.parseInt(wardNumStr);
                    Ward ward = wardRepository.findByWardNumber(wardNumber)
                            .orElseThrow(() -> new RuntimeException("Ward " + wardNumber + " not found."));

                    // Create Citizen
                    Citizen citizen = new Citizen();
                    citizen.setFullName(fullName);
                    citizen.setBirthDate(birthDate);
                    citizen.setAge(age);
                    citizen.setAddress(address);
                    citizen.setAadharNumber(aadhar);
                    citizen.setMobileNumber(mobile.isEmpty() ? null : mobile);
                    citizen.setGender(gender);
                    citizen.setWard(ward);
                    // Bulk upload without photo MUST be PENDING
                    citizen.setStatus(com.smartgrams.userstory1.entity.CitizenStatus.PENDING_APPROVAL);

                    citizenRepository.save(citizen);
                    successCount++;

                } catch (Exception e) {
                    failureCount++;
                    errors.append("Line ").append(lineNumber).append(": ").append(e.getMessage()).append("; ");
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage());
        }

        response.put("successCount", successCount);
        response.put("failureCount", failureCount);
        response.put("errors", errors.toString());

        auditService.log("BULK_UPLOAD", "Citizen", "N/A",
                "Bulk upload result: Success=" + successCount + ", Fail=" + failureCount);
        return response;
    }
}
