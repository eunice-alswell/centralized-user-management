# Centralized User Management System - Test Cases

## Overview
This document contains test cases for the Centralized User Management System, covering authentication, authorization, user-application assignments, and edge cases.

---

## 🔹 Test Case 1: Login with Valid Credentials

**Test Case ID:** TC001
**Type:** Positive Test - Authentication(login)
**Description/Objective:** Verify that a user can successfully log in with correct email and password, and receives a valid JWT token

**Prerequisites:**
- User "admin@example.com" exists with password "Awesomeness10#" and role "Admin"
- System is running and accessible

**Steps:**
1. Navigate to login page
2. Enter email: `admin@example.com`
3. Enter password: `Awesomeness10#`
4. Select role: "Admin"
5. Click "Sign In" button

**Expected Results:**
- ✅ Login request returns HTTP 200 OK
- ✅ Response includes JWT token
- ✅ Response contains user details:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```
- Success message displays in UI or frontend: "✓ Successfully signed in as Admin!"
- User is redirected to admin console (`/admin/users`)

**Test Status:** PASS

---

## Test Case 2: Login with Invalid Password

**Test Case ID:** TC002
**Type:** Negative Test - Authentication(login)
**Description/Objective:** Verify that login fails when user enters an incorrect password and receives appropriate error message

**Prerequisites:**
- User "admin@example.com" exists with password "Awesomeness10#"
- System is running and accessible

**Steps:**
1. Navigate to login page
2. Enter email: `admin@example.com`
3. Enter password: `WrongPassword123#`
4. Select role: "Admin"
5. Click "Sign In" button

**Expected Results:**
- Login request returns HTTP 401 Unauthorized
- Error message displays: "Invalid credentials" or similar
- No JWT token is issued
- User remains on login page (no redirect)
- Form data is cleared for security

**Test Status:** PASS

---

## Test Case 3: User Selects Application and Verifies Access

**Test Case ID:** TC003
**Type:** Positive Test - Authorization & Application Access
**Description/Objective:** Verify that a user can log in with User role and receives confirmation of their access to a selected application

**Prerequisites:**
- User "john@example.com" exists with password "ValidPass123#" and role "User"
- User is already assigned to "HR Portal" application
- "HR Portal" application exists in the database
- System is running and accessible

**Steps:**
1. Navigate to login page
2. Enter email: `john@example.com`
3. Enter password: `ValidPass123#`
4. Select role: "User"
5. Select application dropdown: "HR Portal"
6. Click "Sign In" button

**Expected Results:**
- Login authentication succeeds
- System checks user's assigned applications via `/userapplication/user/{userId}` endpoint
- User has access to "HR Portal" application
- Alert displays: "✓ You have access to "HR Portal""
- User clicks "OK" to dismiss alert
- Login form clears (email, password, application selection reset)
- User remains on login page (no redirect to admin console)

**Test Status:** PASS

---

## Test Case 4: User Without Application Access

**Test Case ID:** TC004
**Type:** Negative Test - Authorization & Application Access
**Description/Objective:** Verify that a user is denied access when attempting to verify access to an application they are not assigned to

**Prerequisites:**
- User "jane@example.com" exists with password "ValidPass456#" and role "User"
- User is assigned to "Finance System" application only
- User is NOT assigned to "HR Portal" application
- Both applications exist in the database
- System is running and accessible

**Steps:**
1. Navigate to login page
2. Enter email: `jane@example.com`
3. Enter password: `ValidPass456#`
4. Select role: "User"
5. Select application dropdown: "HR Portal"
6. Click "Sign In" button

**Expected Results:**
- Login authentication succeeds
- System checks user's assigned applications via `/userapplication/user/{userId}` endpoint
- User does NOT have access to "HR Portal" application
- Alert displays: "✗ You don't have access to the selected application. Contact an administrator to request access."
- User clicks "OK" to dismiss alert
- User remains on login page
- Form is NOT cleared (user can retry with different application)

**Test Status:** PASS

---

## Test Case 5: Admin Assigns User to Application

**Test Case ID:** TC005
**Type:** Positive Test - Application Assignment
**Description/Objective:** Verify that an admin can successfully assign a user to an application

**Prerequisites:**
- Admin user "admin@example.com" is logged in and has valid JWT token
- Regular user "newuser@example.com" exists with role "User"
- "HR" application exists with a valid applicationId
- System is running and accessible

**Steps:**
1. Admin navigates to admin console
2. Click on "Assign Access" page
3. Select user: "newuser@example.com"
4. Select application: "HR"
5. Click "Assign" button

**Expected Results:**
- Assignment request returns HTTP 200 OK
- Response message: "User assigned to application successfully."
- Record is created in the `user_applications` table
- Success notification displays in the UI
- User can now log in with User role and select "HR" to verify access
- User receives: "✓ You have access to "HR""

**Test Status:** PASS

---

## Test Case 6: Prevent Duplicate User-Application Assignment

**Test Case ID:** TC006
**Type:** Edge Case Test - Data Integrity
**Description/Objective:** Verify that the system prevents duplicate assignments of the same user to the same application

**Prerequisites:**
- Admin user "admin@example.com" is logged in with valid JWT token
- Regular user "testuser@example.com" is already assigned to "HR Portal" application
- Assignment record exists in `user_applications` table
- System is running and accessible

**Steps:**
1. Admin navigates to admin console
2. Click on "Assign Access" page
3. Select user: "testuser@example.com"
4. Select application: "HR Portal" (already assigned)
5. Click "Assign" button

**Expected Results:**
- Assignment request returns HTTP 400 Bad Request or 409 Conflict
- Error message displays: "User is already assigned to this application" or similar
- No duplicate record is created in the database
- Original assignment remains unchanged
- Error notification displays in the UI

**Test Status:** PASS

---

## Test Case 7: Deactivated User Cannot Login

**Test Case ID:** TC007
**Type:** Negative Test - Security and Authorization
**Description/Objective:** Verify that a deactivated user cannot log in to the system

**Prerequisites:**
- User "olduser@example.com" exists with password "OldPass123#" and role "User"
- User account has been deactivated (isActive = false)
- System is running and accessible

**Steps:**
1. Navigate to login page
2. Enter email: `olduser@example.com`
3. Enter password: `OldPass123#`
4. Select role: "User"
5. Select any application from dropdown
6. Click "Sign In" button

**Expected Results:**
- Login request returns HTTP 401 Unauthorized
- Error message displays: "User is inactive" or "Account has been deactivated"
- No JWT token is issued
- User remains on login page (no redirect)
- Form data is cleared for security

**Test Status:** PASS


## Test Coverage

- Positive Path (Valid credentials, authorized access)
- Negative Path (Invalid credentials, unauthorized access)
- Edge Cases (Duplicate assignments)
- Security (Deactivated users, password validation)
- Integration (Frontend + Backend + Database)
