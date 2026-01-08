package com.smartgrams.userstory1.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.smartgrams.userstory1.entity.Candidate;
import com.smartgrams.userstory1.service.CandidateService;

@RestController
@RequestMapping("/api/voting")
public class VotingController {

    private final CandidateService candidateService;
    private final com.smartgrams.userstory1.service.ElectionService electionService;
    private final com.smartgrams.userstory1.repository.WardRepository wardRepository;

    public VotingController(CandidateService candidateService,
            com.smartgrams.userstory1.service.ElectionService electionService,
            com.smartgrams.userstory1.repository.WardRepository wardRepository) {
        this.candidateService = candidateService;
        this.electionService = electionService;
        this.wardRepository = wardRepository;
    }

    @GetMapping("/election/ward/{wardNumber}")
    public com.smartgrams.userstory1.entity.Election getElectionForWard(@PathVariable Integer wardNumber) {
        var ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        return electionService.getLatestElectionForWard(ward.getId());
    }

    @GetMapping("/candidates/ward/{wardNumber}")
    public List<Candidate> getCandidatesByWard(@PathVariable Integer wardNumber) {
        return candidateService.getCandidatesByWard(wardNumber);
    }

    @GetMapping("/candidates/election/{electionId}")
    public List<Candidate> getCandidatesByElection(@PathVariable Long electionId) {
        return candidateService.getCandidatesByElection(electionId);
    }

    @GetMapping("/candidates/election/{electionId}/ward/{wardNumber}")
    public List<Candidate> getCandidatesByElectionAndWard(@PathVariable Long electionId,
            @PathVariable Integer wardNumber) {
        return candidateService.getCandidatesByElectionAndWard(electionId, wardNumber);
    }

    @PostMapping(value = "/candidates/ward/{wardNumber}", consumes = "multipart/form-data")
    public Candidate createCandidate(
            @PathVariable Integer wardNumber,
            @RequestParam(value = "electionId", required = false) Long electionId,
            @RequestPart("candidate") Candidate candidate,
            @RequestPart(value = "symbol", required = false) org.springframework.web.multipart.MultipartFile symbol) {
        return candidateService.createCandidate(candidate, wardNumber, electionId, symbol);
    }

    @DeleteMapping("/candidates/{id}")
    public void deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
    }

    @PostMapping("/vote")
    public Map<String, String> castVote(@RequestParam Long citizenId, @RequestParam Long candidateId) {
        candidateService.castVote(citizenId, candidateId);
        return Map.of("status", "success", "message", "Vote cast successfully.");
    }

    @GetMapping("/results/ward/{wardNumber}")
    public ResponseEntity<?> getWardResults(
            @PathVariable Integer wardNumber,
            jakarta.servlet.http.HttpServletRequest request) {

        var ward = wardRepository.findByWardNumber(wardNumber)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
        var election = electionService.getLatestElectionForWard(ward.getId());

        boolean isAdmin = request.isUserInRole("ROLE_ADMIN") ||
                request.isUserInRole("ROLE_SUPER_ADMIN") ||
                request.isUserInRole("ROLE_WARD_OFFICER") ||
                request.isUserInRole("ROLE_GRAM_PANCHAYAT_ADMIN");

        if (!isAdmin && (election == null
                || election.getStatus() != com.smartgrams.userstory1.entity.ElectionStatus.LOCKED)) {
            return ResponseEntity.status(403).body(Map.of("message", "Results are not published yet."));
        }

        List<Candidate> candidates = candidateService.getCandidatesByWard(wardNumber);
        Candidate winner = candidateService.getWinnerByWard(wardNumber);

        return ResponseEntity.ok(Map.of(
                "candidates", candidates,
                "winner", winner != null ? winner : "No candidates",
                "status", election != null ? election.getStatus() : "N/A"));
    }

    @GetMapping("/results/all")
    public ResponseEntity<?> getAllResults(jakarta.servlet.http.HttpServletRequest request) {
        boolean isAdmin = request.isUserInRole("ROLE_ADMIN") ||
                request.isUserInRole("ROLE_SUPER_ADMIN") ||
                request.isUserInRole("ROLE_WARD_OFFICER") ||
                request.isUserInRole("ROLE_GRAM_PANCHAYAT_ADMIN");

        if (!isAdmin) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied."));
        }
        return ResponseEntity.ok(candidateService.getAllCandidates());
    }

    @GetMapping("/candidates/election/{electionId}/ward/{wardNumber}/with-nota")
    public List<Candidate> getCandidatesWithNota(@PathVariable Long electionId, @PathVariable Integer wardNumber) {
        List<Candidate> list = candidateService.getCandidatesByElectionAndWard(electionId, wardNumber);
        // Add a virtual NOTA candidate
        Candidate nota = new Candidate();
        nota.setId(0L);
        nota.setName("NOTA");
        nota.setPartyName("None of the Above");
        nota.setSymbolPath(null);
        list.add(nota);
        return list;
    }
}
