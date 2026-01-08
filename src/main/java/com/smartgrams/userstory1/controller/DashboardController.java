package com.smartgrams.userstory1.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrams.userstory1.entity.CitizenStatus;
import com.smartgrams.userstory1.repository.CandidateRepository;
import com.smartgrams.userstory1.repository.CitizenRepository;
import com.smartgrams.userstory1.repository.WardRepository;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final WardRepository wardRepository;
    private final CitizenRepository citizenRepository;
    private final CandidateRepository candidateRepository;
    private final com.smartgrams.userstory1.repository.ElectionRepository electionRepository;

    public DashboardController(WardRepository wardRepository,
            CitizenRepository citizenRepository,
            CandidateRepository candidateRepository,
            com.smartgrams.userstory1.repository.ElectionRepository electionRepository) {
        this.wardRepository = wardRepository;
        this.citizenRepository = citizenRepository;
        this.candidateRepository = candidateRepository;
        this.electionRepository = electionRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        long totalWards = wardRepository.count();
        long totalVoters = citizenRepository.countByAgeGreaterThanEqual(18);
        long totalVoted = citizenRepository.countByHasVotedTrue();
        long pendingApprovals = citizenRepository.countByStatus(CitizenStatus.PENDING_APPROVAL);
        long activeElections = electionRepository.countByStatus(com.smartgrams.userstory1.entity.ElectionStatus.ACTIVE);

        double votingPercentage = 0.0;
        if (totalVoters > 0) {
            votingPercentage = ((double) totalVoted / totalVoters) * 100;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalWards", totalWards);
        stats.put("totalVoters", totalVoters);
        stats.put("votingPercentage", Math.round(votingPercentage * 100.0) / 100.0); // round 2 decimals
        stats.put("activeElections", activeElections);
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("totalCitizens", citizenRepository.count());

        return stats;
    }
}
