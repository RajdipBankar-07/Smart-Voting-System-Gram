package com.smartgrams.userstory1.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smartgrams.userstory1.entity.Citizen;
import com.smartgrams.userstory1.entity.Ward;

public interface CitizenRepository extends JpaRepository<Citizen, Long> {

    List<Citizen> findByWard(Ward ward);

    Optional<Citizen> findByAadharNumber(String aadharNumber);

    Optional<Citizen> findByUsername(String username);

    Optional<Citizen> findByIdAndFullNameIgnoreCase(Long id, String fullName);

    Optional<Citizen> findByMobileNumber(String mobileNumber);

    Optional<Citizen> findByVoterId(String voterId);

    long countByAgeGreaterThanEqual(int age);

    long countByHasVotedTrue();

    long countByStatus(com.smartgrams.userstory1.entity.CitizenStatus status);
}
