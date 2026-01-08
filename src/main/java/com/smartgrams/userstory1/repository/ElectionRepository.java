package com.smartgrams.userstory1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartgrams.userstory1.entity.Election;
import com.smartgrams.userstory1.entity.ElectionStatus;
import java.util.List;

public interface ElectionRepository extends JpaRepository<Election, Long> {
    List<Election> findByStatus(ElectionStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Election e JOIN e.wards w WHERE w.id = :wardId ORDER BY e.startDate DESC")
    List<Election> findByWardId(Long wardId);

    long countByStatus(ElectionStatus status);
}
