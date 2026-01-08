# Smart-Voting-System-Gram
Voting System Software 



# Smart Gram System

A comprehensive Smart Village Management System designed to digitize and streamline administrative tasks for Gram Panchayats. This application facilitates citizen management, election processes, scheme tracking, and overall village administration.

## 🚀 Features

### Core Administration (User Story 1)
- **Citizen Management**: Add, update, and manage citizen records (Active, Migrated, Deceased).
- **Ward Management**: Manage ward boundaries, population statistics, and history.
- **Role-Based Access Control (RBAC)**: Secure access for Super Admins, Ward Officers, and Data Entry Operators using Spring Security.

### Scheme & Benefit Tracking (User Story 2)
- **Beneficiary Management**: Track schemes and benefits distributed to villagers.
- **Application Processing**: Workflow for scheme applications.

### Election Management (Upcoming)
- **Voting System**: Integrated modules for managing local elections (Candidate symbols, results).

## 🛠️ Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.3.4**
- **Spring Data JPA** (Hibernate)
- **Spring Security**
- **MySQL** (Database)
- **Maven** (Build Tool)

### Frontend
- **React 18**
- **Vite** (Build tool)
- **React Router Dom** (Navigation)
- **Lucide React** (Icons)
- **Axios** (HTTP Client)

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Java Development Kit (JDK) 17**
- **Node.js** (v18 or higher) & **npm**
- **MySQL Server**
- **Maven**

## ⚙️ Installation & Setup

### 1. Database Configuration
1. Create a MySQL database (e.g., `smart_gram_db`).
2. Update the `src/main/resources/application.properties` file with your database credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smart_gram_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 2. Backend Setup
Navigate to the root directory and run the Spring Boot application:
```bash
# Clean and install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```
The backend server will start at `http://localhost:8080`.

### 3. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend application will start at `http://localhost:5173` (default Vite port).

## 🤝 Contribution

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

