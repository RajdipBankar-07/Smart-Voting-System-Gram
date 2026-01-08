---
description: Run the Smart Village Application
---
1. Start the Backend:
   - Open a terminal.
   - Run: `mvn spring-boot:run`
   - Wait for it to start on port 8080.

2. Start the Frontend:
   - Open another terminal.
   - Navigate to `frontend`: `cd frontend`
   - Run: `npm run dev`
   - Open `http://localhost:5173` in your browser.

3. Login:
   - Create a user first via API or use the `AuthController` registration endpoint if available, or simpler:
   - The system uses Basic Auth. You can Register a user by sending a POST request to `http://localhost:8080/api/auth/register` with JSON:
     ```json
     {
       "username": "admin",
       "password": "password",
       "role": "SUPER_ADMIN"
     }
     ```
   - Then login on the frontend with these credentials.
