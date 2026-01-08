package com.smartgrams.userstory2.entity;

import java.time.LocalDate;
import jakarta.persistence.*;
import com.smartgrams.userstory1.entity.Citizen;

@Entity
@Table(name = "citizen_schemes", uniqueConstraints = @UniqueConstraint(columnNames = { "citizen_id", "scheme_id" }))
public class CitizenScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne
    @JoinColumn(name = "scheme_id", nullable = false)
    private Scheme scheme;

    private String status; // APPLIED, APPROVED, REJECTED

    private LocalDate appliedDate;
    private LocalDate approvedDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Citizen getCitizen() {
        return citizen;
    }

    public void setCitizen(Citizen citizen) {
        this.citizen = citizen;
    }

    public Scheme getScheme() {
        return scheme;
    }

    public void setScheme(Scheme scheme) {
        this.scheme = scheme;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public LocalDate getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(LocalDate approvedDate) {
        this.approvedDate = approvedDate;
    }
}
