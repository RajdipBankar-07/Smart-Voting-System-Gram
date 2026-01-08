package com.smartgrams.userstory1.service;

import com.smartgrams.userstory1.entity.AuditLog;
import com.smartgrams.userstory1.repository.AuditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void logAction(String action, Long wardId, String details) {
        // Auto-detect context info
        String username = "SYSTEM";
        String role = "UNKNOWN";
        String ipAddress = "0.0.0.0";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            username = auth.getName();
            role = auth.getAuthorities().toString();
        }

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ipAddress = getClientIp(request);
        }

        logAction(action, username, role, wardId, ipAddress, details);
    }

    @Override
    public void logAction(String action, String username, String role, Long wardId, String ipAddress, String details) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setUsername(username);
        log.setUserRole(role);
        log.setWardId(wardId);
        log.setIpAddress(ipAddress);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
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
