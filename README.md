# Centralized User Management System

This is a secure, full-stack user management and authentication system enabling centralized credential management across internal applications with role-based access control.

## Technology Stack

- **Backend:** C# .NET 10.0, Entity Framework Core, PostgreSQL
- **Frontend:** React 18 + Vite, TypeScript, Tailwind CSS
- **Security:** JWT authentication, BCrypt password hashing, role-based authorization

## Features

- User creation and deactivation with secure password management
- Application directory (HR System, Accounting System)
- User-application assignment and access verification
- Login API with JWT authentication and role-based authorization
- Admin console for user and application management
- Backend-enforced authorization on all operations

## Quick Setup

**Prerequisites:** .NET 10.0 SDK, PostgreSQL 12+, Node.js 18+

### Backend

```bash
cd backend
dotnet restore
# Configure database in .env (see SETUP_INSTRUCTIONS.md)
dotnet ef database update
dotnet run
```
Backend: `http://localhost:5249`

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

**Test Login:** Email: `admin@example.com` | Password: `Admin@123`

## Approach

When I looked at the problem, the main issue was that users had to manage separate credentials for different internal systems like HR and Accounting. This creates inconsistency, duplication, and more support overhead.

So my approach was to simplify everything by introducing a centralized user management system where a user exists only once and can be assigned access to different applications from a single place.

I started by designing the system around three core entities:

- Users
- Applications
- User-Application mapping

This allowed me to handle both authentication and access control cleanly.

For authentication, I implemented a login system that validates user credentials and returns a JWT token. I also ensured passwords are securely stored using hashing.

For authorization, instead of allowing access by default, I introduced a mapping system where users are explicitly assigned to applications. This way, access is controlled at the backend and not just the UI.

From a structure perspective, I separated concerns using:

- Controllers for API endpoints
- Services for business logic
- DTOs for clean data transfer

This made the system easier to maintain and closer to real-world architecture.

I also considered data integrity by:

- Preventing duplicate user-application assignments
- Enforcing validation at both API and database levels

Finally, I approached the project with a Quality Assurance mindset by defining test cases that cover:

- Successful login
- Invalid credentials
- Duplicate assignments
- Basic security scenarios

Overall, my goal was not just to make the system work, but to design it in a way that is scalable, secure, and easy to manage.

## Test Coverage

Comprehensive test scenarios documented in [TEST_CASES.md](./TEST_CASES.md):
- Successful admin/user authentication
- Role-based console access restrictions
- Application assignment and access verification
- Deactivated user login prevention
- Duplicate assignment prevention

See SETUP_INSTRUCTIONS.md for environment configuration and quick start details.

## License

Proprietary - Internal Use Only
