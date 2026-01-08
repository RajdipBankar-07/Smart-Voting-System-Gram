package com.smartgrams.userstory1.controller;

import com.smartgrams.userstory1.entity.Election;
import com.smartgrams.userstory1.entity.ElectionStatus;
import com.smartgrams.userstory1.service.ElectionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elections")
public class ElectionController {

    private final ElectionService electionService;

    public ElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    @GetMapping
    public List<Election> getAllElections() {
        return electionService.getAllElections();
    }

    @PostMapping
    public Election createElection(@RequestBody ElectionWrapper wrapper) {
        return electionService.createElection(wrapper.getElection(), wrapper.getWardIds());
    }

    @PutMapping("/{id}")
    public Election updateElection(@PathVariable Long id, @RequestBody ElectionWrapper wrapper) {
        return electionService.updateElection(id, wrapper.getElection(), wrapper.getWardIds());
    }

    @PutMapping("/{id}/status")
    public Election updateStatus(@PathVariable Long id, @RequestParam ElectionStatus status) {
        return electionService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteElection(@PathVariable Long id) {
        electionService.deleteElection(id);
    }

    // Inner wrapper class for JSON mapping of wards list + election details
    public static class ElectionWrapper {
        private Election election;
        private List<Long> wardIds;

        public Election getElection() {
            return election;
        }

        public void setElection(Election election) {
            this.election = election;
        }

        public List<Long> getWardIds() {
            return wardIds;
        }

        public void setWardIds(List<Long> wardIds) {
            this.wardIds = wardIds;
        }
    }
}
