package com.smartgrams.userstory2.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartgrams.userstory1.entity.Citizen;
import com.smartgrams.userstory2.entity.CitizenScheme;
import com.smartgrams.userstory2.entity.Scheme;
import com.smartgrams.userstory1.repository.CitizenRepository;
import com.smartgrams.userstory2.repository.CitizenSchemeRepository;
import com.smartgrams.userstory2.repository.SchemeRepository;

@Service
public class CitizenSchemeServiceImpl implements CitizenSchemeService {

    private final CitizenSchemeRepository citizenSchemeRepository;
    private final CitizenRepository citizenRepository;
    private final SchemeRepository schemeRepository;

    public CitizenSchemeServiceImpl(CitizenSchemeRepository citizenSchemeRepository,
            CitizenRepository citizenRepository,
            SchemeRepository schemeRepository) {
        this.citizenSchemeRepository = citizenSchemeRepository;
        this.citizenRepository = citizenRepository;
        this.schemeRepository = schemeRepository;
    }

    @Override
    public CitizenScheme applyScheme(Long citizenId, Long schemeId) {
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));
        Scheme scheme = schemeRepository.findById(schemeId)
                .orElseThrow(() -> new RuntimeException("Scheme not found"));

        // Check if already applied
        if (citizenSchemeRepository.findByCitizenAndScheme(citizen, scheme).isPresent()) {
            throw new RuntimeException("Citizen already applied for this scheme");
        }

        CitizenScheme citizenScheme = new CitizenScheme();
        citizenScheme.setCitizen(citizen);
        citizenScheme.setScheme(scheme);
        citizenScheme.setStatus("APPLIED");
        citizenScheme.setAppliedDate(LocalDate.now());

        return citizenSchemeRepository.save(citizenScheme);
    }

    @Override
    public CitizenScheme approveScheme(Long id) {
        CitizenScheme citizenScheme = citizenSchemeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        citizenScheme.setStatus("APPROVED");
        citizenScheme.setApprovedDate(LocalDate.now());
        return citizenSchemeRepository.save(citizenScheme);
    }

    @Override
    public CitizenScheme rejectScheme(Long id) {
        CitizenScheme citizenScheme = citizenSchemeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        citizenScheme.setStatus("REJECTED");
        return citizenSchemeRepository.save(citizenScheme);
    }

    @Override
    public List<CitizenScheme> getCitizenSchemes(Long citizenId) {
        return citizenSchemeRepository.findByCitizenId(citizenId);
    }
}
