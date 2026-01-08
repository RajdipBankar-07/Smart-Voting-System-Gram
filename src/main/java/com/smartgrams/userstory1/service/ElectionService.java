package com.smartgrams.userstory1.service;

import com.smartgrams.userstory1.entity.Election;
import com.smartgrams.userstory1.entity.ElectionStatus;
import java.util.List;

public interface ElectionService {
    List<Election> getAllElections();

    Election createElection(Election election, List<Long> wardIds);

    Election updateElection(Long id, Election election, List<Long> wardIds);

    Election updateStatus(Long id, ElectionStatus status);

    void deleteElection(Long id);

    Election getActiveElectionForWard(Long wardId);

    Election getLatestElectionForWard(Long wardId);
}
