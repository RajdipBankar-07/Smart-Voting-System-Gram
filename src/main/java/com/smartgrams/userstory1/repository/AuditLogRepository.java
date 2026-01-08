package com.smartgrams.userstory1.repository;

import com.smartgrams.userstory1.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
