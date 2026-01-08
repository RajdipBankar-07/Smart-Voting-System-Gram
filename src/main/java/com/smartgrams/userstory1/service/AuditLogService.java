package com.smartgrams.userstory1.service;

public interface AuditLogService {
    void logAction(String action, Long wardId, String details);

    void logAction(String action, String username, String role, Long wardId, String ipAddress, String details);
}
