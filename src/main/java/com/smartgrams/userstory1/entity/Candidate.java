package com.smartgrams.userstory1.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String partyName;

    private String symbolPath; // Path to image or an emoji char

    private Long voteCount = 0L;

    @ManyToOne
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @ManyToOne
    @JoinColumn(name = "election_id", nullable = true) // Nullable for compatibility if needed
    private Election election;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPartyName() {
        return partyName;
    }

    public void setPartyName(String partyName) {
        this.partyName = partyName;
    }

    public String getSymbolPath() {
        return symbolPath;
    }

    public void setSymbolPath(String symbolPath) {
        this.symbolPath = symbolPath;
    }

    public Long getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Long voteCount) {
        this.voteCount = voteCount;
    }

    public Ward getWard() {
        return ward;
    }

    public void setWard(Ward ward) {
        this.ward = ward;
    }

    public Election getElection() {
        return election;
    }

    public void setElection(Election election) {
        this.election = election;
    }
}
