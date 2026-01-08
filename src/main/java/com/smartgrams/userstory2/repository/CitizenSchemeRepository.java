package com.smartgrams.userstory2.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.smartgrams.userstory1.entity.Citizen;
import com.smartgrams.userstory2.entity.CitizenScheme;
import com.smartgrams.userstory2.entity.Scheme;

public interface CitizenSchemeRepository extends JpaRepository<CitizenScheme, Long> {

    Optional<CitizenScheme> findByCitizenAndScheme(Citizen citizen, Scheme scheme);

    List<CitizenScheme> findByCitizenId(Long citizenId);
}
