package com.smartgrams.userstory1.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartgrams.userstory1.entity.Candidate;
import com.smartgrams.userstory1.entity.Citizen;
import com.smartgrams.userstory1.entity.Election;
import com.smartgrams.userstory1.entity.Ward;
import com.smartgrams.userstory1.repository.CandidateRepository;
import com.smartgrams.userstory1.repository.CitizenRepository;
import com.smartgrams.userstory1.repository.ElectionRepository;
import com.smartgrams.userstory1.repository.WardRepository;

@Service
@Transactional
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final WardRepository wardRepository;
    private final CitizenRepository citizenRepository;
    private final ElectionRepository electionRepository;
    private final AuditService auditService;

    @Value("${file.upload.dir:uploads}")
    private String uploadBaseDir;

    public CandidateServiceImpl(CandidateRepository candidateRepository,
            WardRepository wardRepository,
            CitizenRepository citizenRepository,
            ElectionRepository electionRepository,
            AuditService auditService) {
        this.candidateRepository = candidateRepository;
        this.wardRepository = wardRepository;
        this.citizenRepository = citizenRepository;
        this.electionRepository = electionRepository;
        this.auditService = auditService;
    }

    @Override
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    @Override
    public List<Candidate> getCandidatesByWard(Integer wardNumber) {
        Ward ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        return candidateRepository.findByWard(ward);
    }

    @Override
    public List<Candidate> getCandidatesByElection(Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Election not found"));
        return candidateRepository.findByElection(election);
    }

    @Override
    public List<Candidate> getCandidatesByElectionAndWard(Long electionId, Integer wardNumber) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Election not found"));
        Ward ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        return candidateRepository.findByElectionAndWard(election, ward);
    }

    @Override
    public Candidate createCandidate(Candidate candidate, Integer wardNumber, Long electionId, MultipartFile symbol) {
        Ward ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));

        Election election = null;
        if (electionId != null) {
            election = electionRepository.findById(electionId)
                    .orElseThrow(() -> new RuntimeException("Election not found"));
        }

        candidate.setWard(ward);
        candidate.setElection(election);
        candidate.setVoteCount(0L); // Initialize vote count

        if (symbol != null && !symbol.isEmpty()) {
            candidate.setSymbolPath(storeSymbol(symbol));
        }

        Candidate saved = candidateRepository.save(candidate);
        auditService.log("CREATE", "Candidate", saved.getId().toString(),
                "Name: " + saved.getName() + ", Party: " + saved.getPartyName() + ", Election: "
                        + (election != null ? election.getName() : "None"),
                saved.getWard().getId());
        return saved;
    }

    private String storeSymbol(MultipartFile file) {
        try {
            String base = uploadBaseDir.endsWith(File.separator) ? uploadBaseDir : uploadBaseDir + File.separator;
            String subDir = "symbols";
            String dirPath = base + subDir + File.separator;
            File dir = new File(dirPath);
            if (!dir.exists())
                dir.mkdirs();

            String original = file.getOriginalFilename() == null ? "symbol"
                    : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            String filename = "sym_" + System.currentTimeMillis() + "_" + original;
            Path dest = Paths.get(dirPath, filename);
            Files.write(dest, file.getBytes());
            return subDir + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save symbol: " + e.getMessage());
        }
    }

    @Override
    public void deleteCandidate(Long id) {
        Candidate c = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        candidateRepository.delete(c);
        auditService.log("DELETE", "Candidate", id.toString(), "Deleted candidate: " + c.getName(),
                c.getWard().getId());
    }

    @Override
    public void castVote(Long citizenId, Long candidateId) {
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        if (Boolean.TRUE.equals(citizen.getHasVoted())) {
            throw new RuntimeException("Citizen has already voted.");
        }

        if (citizen.getStatus() != com.smartgrams.userstory1.entity.CitizenStatus.ACTIVE) {
            throw new RuntimeException("Voting Access Denied. Your status is: " + citizen.getStatus());
        }

        Candidate candidate;
        if (candidateId == 0) {
            // Handle NOTA
            // Let's try to find a candidate named NOTA in this ward.
            Candidate nota = candidateRepository.findAll().stream()
                    .filter(c -> "NOTA".equals(c.getName()) && c.getWard().getId().equals(citizen.getWard().getId()))
                    .findFirst().orElse(null);

            if (nota == null) {
                nota = new Candidate();
                nota.setName("NOTA");
                nota.setPartyName("None of the Above");
                nota.setWard(citizen.getWard());
                nota.setVoteCount(0L);

                // Find ANY other candidate in this ward to copy their election
                List<Candidate> others = candidateRepository.findByWard(citizen.getWard());
                if (!others.isEmpty()) {
                    nota.setElection(others.get(0).getElection());
                }

                candidateRepository.save(nota);
            }
            candidate = nota;
        } else {
            candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new RuntimeException("Candidate not found"));

            // Ensure citizen belongs to the same ward as the candidate
            if (!citizen.getWard().getId().equals(candidate.getWard().getId())) {
                throw new RuntimeException("Citizen can only vote for candidates in their own ward.");
            }
        }

        candidate.setVoteCount(candidate.getVoteCount() + 1);
        candidateRepository.save(candidate);

        citizen.setHasVoted(true);
        citizenRepository.save(citizen);

        auditService.log("VOTE", "Candidate", candidate.getId().toString(),
                "Citizen " + citizenId + " voted for " + candidate.getName(), citizen.getWard().getId());
    }

    @Override
    public void resetVotes() {
        List<Candidate> candidates = candidateRepository.findAll();
        candidates.forEach(c -> c.setVoteCount(0L));
        candidateRepository.saveAll(candidates);

        List<Citizen> citizens = citizenRepository.findAll();
        citizens.forEach(c -> c.setHasVoted(false));
        citizenRepository.saveAll(citizens);
    }

    @Override
    public Candidate getWinnerByWard(Integer wardNumber) {
        Ward ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        List<Candidate> candidates = candidateRepository.findByWard(ward);

        return candidates.stream()
                .max((c1, c2) -> Long.compare(c1.getVoteCount(), c2.getVoteCount()))
                .orElse(null);
    }
}
