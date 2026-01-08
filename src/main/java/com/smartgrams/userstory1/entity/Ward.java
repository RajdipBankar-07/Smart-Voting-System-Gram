package com.smartgrams.userstory1.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wards")
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ward_number", nullable = false, unique = true)
    private Integer wardNumber;

    @Column(name = "ward_name")
    private String wardName;

    @Column(name = "area_name")
    private String areaName;

    @Column(name = "ward_boundary", columnDefinition = "TEXT")
    private String wardBoundary;

    @Column(name = "population")
    private Integer population;

    @Column(name = "assigned_officer")
    private String assignedOfficer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WardStatus status = WardStatus.ACTIVE;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getWardNumber() {
        return wardNumber;
    }

    public void setWardNumber(Integer wardNumber) {
        this.wardNumber = wardNumber;
    }

    public String getWardName() {
        return wardName;
    }

    public void setWardName(String wardName) {
        this.wardName = wardName;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public String getWardBoundary() {
        return wardBoundary;
    }

    public void setWardBoundary(String wardBoundary) {
        this.wardBoundary = wardBoundary;
    }

    public Integer getPopulation() {
        return population;
    }

    public void setPopulation(Integer population) {
        this.population = population;
    }

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public WardStatus getStatus() {
        return status;
    }

    public void setStatus(WardStatus status) {
        this.status = status;
    }
}
