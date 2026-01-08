package com.smartgrams.userstory1.service;

import com.smartgrams.userstory1.entity.Election;
import com.smartgrams.userstory1.entity.ElectionStatus;
import com.smartgrams.userstory1.entity.Ward;
import com.smartgrams.userstory1.repository.ElectionRepository;
import com.smartgrams.userstory1.repository.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;


@Service
@Transactional
public class ElectionServiceImpl implements ElectionService {

    private final ElectionRepository electionRepository;
    private final WardRepository wardRepository;
    private final AuditService auditService;

    public ElectionServiceImpl(ElectionRepository electionRepository, WardRepository wardRepository,
            AuditService auditService) {
        this.electionRepository = electionRepository;
        this.wardRepository = wardRepository;
        this.auditService = auditService;
    }

    @Override
    public List<Election> getAllElections() {
        return electionRepository.findAll();
    }

    @Override
    public Election createElection(Election election, List<Long> wardIds) {
        if (wardIds != null && !wardIds.isEmpty()) {
            List<Ward> selectedWards = wardRepository.findAllById(wardIds);
            election.setWards(new HashSet<>(selectedWards));
        }
        Election saved = electionRepository.save(election);
        auditService.log("CREATE", "Election", saved.getId().toString(), "Created Election: " + saved.getName());
        return saved;
    }

    @Override
    public Election updateElection(Long id, Election updates, List<Long> wardIds) {
        Election existing = electionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Election not found"));

        if (updates.getName() != null)
            existing.setName(updates.getName());
        if (updates.getStartDate() != null)
            existing.setStartDate(updates.getStartDate());
        if (updates.getEndDate() != null)
            existing.setEndDate(updates.getEndDate());

        if (wardIds != null) {
            List<Ward> selectedWards = wardRepository.findAllById(wardIds);
            existing.setWards(new HashSet<>(selectedWards));
        }

        return electionRepository.save(existing);
    }

    @Override
    public Election updateStatus(Long id, ElectionStatus status) {
        Election existing = electionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Election not found"));

        existing.setStatus(status);
        Election saved = electionRepository.save(existing);
        auditService.log("UPDATE_STATUS", "Election", saved.getId().toString(), "Status changed to " + status);
        return saved;
    }

    @Override
    public void deleteElection(Long id) {
        electionRepository.deleteById(id);
    }

    @Override
    public Election getActiveElectionForWard(Long wardId) {
        List<Election> activeElections = electionRepository.findByStatus(ElectionStatus.ACTIVE);
        // Naive filter in memory
        return activeElections.stream()
                .filter(e -> e.getWards().stream().anyMatch(w -> w.getId().equals(wardId)))
                .findFirst()
                .orElse(null);
    }

    @Override
    public Election getLatestElectionForWard(Long wardId) {
        List<Election> elections = electionRepository.findByWardId(wardId);
        return elections.isEmpty() ? null : elections.get(0);
    }
}
