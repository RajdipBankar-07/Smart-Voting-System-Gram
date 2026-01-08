package com.smartgrams.userstory1.service;

import java.util.List;
import com.smartgrams.userstory1.entity.Candidate;

public interface CandidateService {
    List<Candidate> getAllCandidates();

    List<Candidate> getCandidatesByWard(Integer wardNumber);

    Candidate createCandidate(Candidate candidate, Integer wardNumber, Long electionId,
            org.springframework.web.multipart.MultipartFile symbol);

    List<Candidate> getCandidatesByElection(Long electionId);

    List<Candidate> getCandidatesByElectionAndWard(Long electionId, Integer wardNumber);

    void castVote(Long citizenId, Long candidateId);

    void resetVotes(); // Utility for testing

    Candidate getWinnerByWard(Integer wardNumber);

    void deleteCandidate(Long id);
}
