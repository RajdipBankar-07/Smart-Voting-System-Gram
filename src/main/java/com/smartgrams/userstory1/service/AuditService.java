package com.smartgrams.userstory1.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.smartgrams.userstory1.entity.AuditLog;
import com.smartgrams.userstory1.repository.AuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String entityName, String entityId, String details) {
        log(action, entityName, entityId, details, null);
    }

    public void log(String action, String entityName, String entityId, String details, Long wardId) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntityName(entityName);
            log.setEntityId(entityId);
            log.setDetails(details);
            log.setWardId(wardId);

            // User Info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                log.setUsername(auth.getName());
                log.setUserRole(auth.getAuthorities().toString());
            } else {
                log.setUsername("SYSTEM/ANONYMOUS");
                log.setUserRole("N/A");
            }

            // IP Address
            if (RequestContextHolder.getRequestAttributes() != null) {
                HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                        .getRequest();
                log.setIpAddress(getClientIp(request));
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = "";
        if (request != null) {
            remoteAddr = request.getHeader("X-FORWARDED-FOR");
            if (remoteAddr == null || "".equals(remoteAddr)) {
                remoteAddr = request.getRemoteAddr();
            }
        }
        return remoteAddr;
    }
}
