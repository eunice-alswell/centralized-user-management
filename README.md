# Centralized User Management System

A secure, full-stack user management and authentication system enabling centralized credential management across internal applications with role-based access control.

## Technology Stack

- **Backend:** C# .NET 10.0, Entity Framework Core, PostgreSQL
- **Frontend:** React 18 + Vite, TypeScript, Tailwind CSS
- **Security:** JWT authentication, BCrypt password hashing, role-based authorization

## Features

- JWT-based authentication with role separation (Admin/User)
- Admin console for user and application management
- User-application assignment with access verification
- Database-driven application directory
- Deactivated user account handling
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

### Architecture: Authentication Separation

The system separates authentication (login) from authorization (access control):
- **Authentication Layer:** JWT-based login validates user identity and returns token
- **Authorization Layer:** Backend enforces role-based access; frontend cannot bypass restrictions
- **Storage Model:** PostgreSQL with User ↔ Application many-to-many relationship

This separation ensures backend controls all access decisions. Users obtain a token on login, but application access is independently verified through the backend before any data is returned. No sensitive information is exposed in the frontend.

### Security Model

**Role-Based Access:**
- **Admin Role:** Can manage users, applications, and assignments through admin console
- **User Role:** Can only view their assigned applications; gets alert on unsuccessful access verification
- **Deactivated Users:** Cannot log in regardless of valid credentials

**Data Protection:**
- Passwords hashed with BCrypt (12 rounds), never returned in responses
- All endpoints enforce role-based authorization at controller level
- User data requests validated against authenticated user identity

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
