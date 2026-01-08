package com.smartgrams.userstory1.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartgrams.userstory1.entity.Citizen;
import com.smartgrams.userstory1.entity.CitizenDocument;

public interface CitizenDocumentRepository extends JpaRepository<CitizenDocument, Long> {
    List<CitizenDocument> findByCitizen(Citizen citizen);
}
