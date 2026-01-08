package com.smartgrams.userstory1.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "citizen_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CitizenDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_type", nullable = false)
    private String documentType; // AADHAAR, WATER_CARD, Driving License etc.

    @Column(name = "document_path", nullable = false)
    private String documentPath;

    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;
}
