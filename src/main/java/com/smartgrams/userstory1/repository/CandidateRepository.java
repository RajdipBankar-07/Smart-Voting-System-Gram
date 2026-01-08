package com.smartgrams.userstory1.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.smartgrams.userstory1.entity.Candidate;
import com.smartgrams.userstory1.entity.Ward;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByWard(Ward ward);

    List<Candidate> findByElection(com.smartgrams.userstory1.entity.Election election);

    List<Candidate> findByElectionAndWard(com.smartgrams.userstory1.entity.Election election, Ward ward);
}
