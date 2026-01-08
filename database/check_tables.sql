-- Quick check to see if tables exist
USE village;

SELECT 
    TABLE_NAME AS 'Table Name',
    TABLE_ROWS AS 'Number of Rows',
    CREATE_TIME AS 'Created At'
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'village'
ORDER BY 
    TABLE_NAME;

