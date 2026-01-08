# Village Project Database Setup

## Database Information
- **Database Name**: `village`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## Tables Created

### 1. `wards`
Stores ward information
- `id` (Primary Key, Auto Increment)
- `ward_number` (Unique, Not Null)
- `ward_name`

### 2. `citizens`
Stores citizen information
- `id` (Primary Key, Auto Increment)
- `full_name` (Not Null)
- `birth_date` (Not Null)
- `age`
- `address` (Not Null)
- `vasti_name`
- `aadhar_number` (Unique, Not Null, 12 characters)
- `photo_path`
- `ward_id` (Foreign Key to wards.id)

**Constraints:**
- Aadhar number must be unique
- Age must be 18+ (enforced by application logic)
- Foreign key relationship with wards table

### 3. `citizen_documents`
Stores citizen document information
- `id` (Primary Key, Auto Increment)
- `document_type` (Not Null)
- `document_path` (Not Null)
- `citizen_id` (Foreign Key to citizens.id)

## How to Use

### Option 1: Automatic (Recommended)
The application will automatically create/update tables when you run it because:
- `spring.jpa.hibernate.ddl-auto=update` is set in `application.properties`

### Option 2: Manual Setup
If you need to manually create the database:

1. Open MySQL command line or MySQL Workbench
2. Run the SQL script:
   ```bash
   mysql -u root -p < database/village_database.sql
   ```
   Or copy and paste the contents of `village_database.sql` into your MySQL client

## Notes
- The database and tables are already configured in the application
- If tables already exist, the script uses `CREATE TABLE IF NOT EXISTS` to avoid errors
- Foreign key constraints ensure data integrity
- Aadhar number uniqueness is enforced at both database and application level

