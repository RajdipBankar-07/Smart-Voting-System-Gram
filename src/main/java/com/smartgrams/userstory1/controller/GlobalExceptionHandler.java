package com.smartgrams.userstory1.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Helper method to check if error is related to Aadhar
    private boolean isAadharError(String message, String rootCause) {
        if (message == null && rootCause == null)
            return false;
        String combined = ((message != null ? message : "") + " " + (rootCause != null ? rootCause : "")).toLowerCase();
        return combined.contains("aadhar") ||
                combined.contains("uk_aadhar_number") ||
                (combined.contains("duplicate entry") && combined.contains("aadhar_number"));
    }

    private boolean isMobileError(String message, String rootCause) {
        if (message == null && rootCause == null)
            return false;
        String combined = ((message != null ? message : "") + " " + (rootCause != null ? rootCause : "")).toLowerCase();
        return combined.contains("mobile") ||
                combined.contains("uk_mobile_number") ||
                (combined.contains("duplicate entry") && combined.contains("mobile_number"));
    }

    // Handle DataIntegrityViolationException FIRST (more specific)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        Map<String, String> errorResponse = new HashMap<>();

        String message = e.getMessage();
        String rootCauseMessage = "";

        // Get root cause message
        if (e.getRootCause() != null) {
            rootCauseMessage = e.getRootCause().getMessage();
        }

        // Check for Aadhar number duplicate
        if (isAadharError(message, rootCauseMessage)) {
            errorResponse.put("error", "Aadhar number is already used. Please use a different Aadhar number.");
            errorResponse.put("message", "Aadhar number is already used. Please use a different Aadhar number.");
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }

        if (isMobileError(message, rootCauseMessage)) {
            errorResponse.put("error", "Mobile number is already used. Please use a different Mobile number.");
            errorResponse.put("message", "Mobile number is already used. Please use a different Mobile number.");
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }

        // Handle other duplicate entries
        String combinedMessage = ((message != null ? message : "") + " "
                + (rootCauseMessage != null ? rootCauseMessage : "")).toLowerCase();
        if (combinedMessage.contains("duplicate entry")) {
            errorResponse.put("error", "Duplicate entry: This record already exists in the database.");
        } else {
            String userMessage = rootCauseMessage != null ? rootCauseMessage
                    : (message != null ? message : "Data validation error");
            errorResponse.put("error",
                    userMessage.contains("Duplicate entry")
                            ? "This record already exists. Please check for duplicate data."
                            : "Data validation error: " + userMessage);
        }

        errorResponse.put("status", "error");
        errorResponse.put("message", errorResponse.get("error"));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    // Handle RuntimeException AFTER DataIntegrityViolationException
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> errorResponse = new HashMap<>();
        String errorMessage = e.getMessage() != null ? e.getMessage() : "An error occurred";
        errorResponse.put("error", errorMessage);
        errorResponse.put("message", errorMessage);
        errorResponse.put("status", "error");

        // Determine HTTP status based on error message
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String lowerMessage = errorMessage.toLowerCase();

        if (lowerMessage.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (lowerMessage.contains("age validation failed") ||
                lowerMessage.contains("18 years or older")) {
            status = HttpStatus.BAD_REQUEST;
        } else if (lowerMessage.contains("aadhar number") &&
                lowerMessage.contains("already used")) {
            status = HttpStatus.CONFLICT;
        }

        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "An unexpected error occurred: " + e.getMessage());
        errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
        errorResponse.put("status", "error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
