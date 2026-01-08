package com.smartgrams.userstory1.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartgrams.userstory1.entity.Ward;

public interface WardRepository extends JpaRepository<Ward, Long> {

    Optional<Ward> findByWardNumber(Integer wardNumber);
}
