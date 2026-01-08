package com.smartgrams.userstory2.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartgrams.userstory2.entity.Scheme;

public interface SchemeRepository extends JpaRepository<Scheme, Long> {
}
