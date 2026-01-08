-- =====================================================
-- Village Project Database Creation Script
-- =====================================================
-- This script creates the 'village' database and all required tables
-- Run this script if you need to manually create the database structure
-- =====================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS village 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Use the village database
USE village;

-- =====================================================
-- Table: wards
-- =====================================================
CREATE TABLE IF NOT EXISTS wards (
    id BIGINT NOT NULL AUTO_INCREMENT,
    ward_number INT NOT NULL,
    ward_name VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uk_ward_number (ward_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: citizens
-- =====================================================
CREATE TABLE IF NOT EXISTS citizens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    age INT,
    address VARCHAR(255) NOT NULL,
    vasti_name VARCHAR(255),
    aadhar_number VARCHAR(12) NOT NULL,
    photo_path VARCHAR(255),
    ward_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_aadhar_number (aadhar_number),
    CONSTRAINT fk_citizen_ward
        FOREIGN KEY (ward_id) REFERENCES wards(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: citizen_documents
-- =====================================================
CREATE TABLE IF NOT EXISTS citizen_documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    document_type VARCHAR(255) NOT NULL,
    document_path VARCHAR(255) NOT NULL,
    citizen_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_document_citizen
        FOREIGN KEY (citizen_id) REFERENCES citizens(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Success Message
-- =====================================================
SELECT 'Database "village" and all tables created successfully!' AS Message;

