# Centralized User Management System - Setup Instructions

Quick start guide for running the system locally.

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/centralized-user-management.git
cd centralized-user-management
```

## Prerequisites

- .NET 10.0 SDK
- PostgreSQL 12+
- Node.js 18+

## Setup

### Step 1: Database Configuration

1. Start PostgreSQL server
2. Create `.env` file in the `backend` folder:

```
DB_CONNECTION_STRING=Server=localhost;Port=5432;Database=centralized_user_management;User Id=postgres;Password=YOUR_PASSWORD;
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-here-12345
```

(A `.env.example` file is included as a template)

### Step 2: Backend Setup

```bash
cd backend
dotnet restore
dotnet ef database update    # Creates database automatically
dotnet run
```

Backend runs at: `http://localhost:5249`

### Step 3: Frontend Setup

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Step 4: Create Initial Admin User

With both backend and frontend running, create the first admin user by running this curl command:

```bash
curl -X POST http://localhost:5249/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Awesomeness10#",
    "role": "Admin",
    "isActive": true
  }'
```

You should see a response like:
```json
{
  "id": "...",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "Admin",
  "isActive": true
}
```

Now you can log in with these credentials on `http://localhost:5173`

## Test Login Credentials

Use these credentials to test the system:

- **Email:** `admin@example.com`
- **Password:** `Awesomeness10#`
- **Role:** Admin

**Note:** There is no "Sign Up" button on the login page. To create new users, log in as admin through the admin console.

## Quick Start (TL;DR)

```bash
# Terminal 1
cd backend
dotnet ef database update
dotnet run

# Terminal 2 (new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and log in with credentials above.

## Troubleshooting

**Backend won't start:**
- Ensure PostgreSQL is running
- Verify `.env` database connection string is correct
- If port 5249 is in use: `netstat -ano | findstr :5249` (Windows)

**Frontend applications dropdown shows "Loading..." but never loads:**
- Verify backend is running at `http://localhost:5249/api/application`
- Check CORS settings if using different localhost ports
- Open browser console (F12) for error details

**Cannot log in:**
- Verify test user credentials above
- Ensure backend database migrations completed successfully

## Test Scenarios

See [TEST_CASES.md](./TEST_CASES.md) for comprehensive testing documentation including:
- Admin authentication and console access
- User role application access verification
- Application assignment and deactivated user handling

## For More Information

Refer to [README.md](../README.md) for project overview and architecture details.
