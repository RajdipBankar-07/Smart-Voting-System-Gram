-- =====================================================
-- Village Project Database Verification Script
-- =====================================================
-- This script verifies that the database and tables exist
-- =====================================================

-- Use the village database
USE village;

-- Check if database exists
SELECT 'Database "village" exists!' AS Status;

-- Show all tables
SHOW TABLES;

-- Verify wards table structure
DESCRIBE wards;

-- Verify citizens table structure
DESCRIBE citizens;

-- Verify citizen_documents table structure
DESCRIBE citizen_documents;

-- Count records in each table
SELECT 'wards' AS TableName, COUNT(*) AS RecordCount FROM wards
UNION ALL
SELECT 'citizens' AS TableName, COUNT(*) AS RecordCount FROM citizens
UNION ALL
SELECT 'citizen_documents' AS TableName, COUNT(*) AS RecordCount FROM citizen_documents;

-- Show foreign key constraints
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'village'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT 'Database verification completed!' AS Message;

