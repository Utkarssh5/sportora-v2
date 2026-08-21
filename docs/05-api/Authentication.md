# 🔐 Authentication Module

## Overview

The Authentication Module is responsible for secure user authentication and authorization across the Sportora platform.

It provides secure account creation, login, session management, token refresh, role-based authorization, password management, and email verification.

---

# Features

- User Registration
- User Login
- JWT Authentication
- Refresh Token
- Logout
- Password Hashing (bcrypt)
- Role-Based Access Control (RBAC)
- Email Verification
- Forgot Password
- Reset Password
- Token Rotation
- Secure HttpOnly Cookies

---

# Authentication Flow

```text
User
   │
   ▼
Register/Login
   │
   ▼
Validation
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
MongoDB
   │
   ▼
JWT Generation
   │
   ▼
Client
```

---

# Endpoints

## Register

POST /api/v1/auth/register

Creates a new Sportora account.

### Request

```json
{
  "fullName": "Utkarsh Tripathi",
  "email": "utkarsh@example.com",
  "password": "Password123",
  "phone": "9876543210",
  "role": "PLAYER"
}
```

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

## Login

POST /api/v1/auth/login

Authenticates an existing user.

Returns:

- Access Token
- Refresh Token

---

## Refresh Token

POST /api/v1/auth/refresh

Issues a new Access Token using a valid Refresh Token.

---

## Logout

POST /api/v1/auth/logout

Terminates the active session and invalidates refresh tokens.

---

## Forgot Password

POST /api/v1/auth/forgot-password

Sends a password reset email.

---

## Reset Password

POST /api/v1/auth/reset-password

Updates the user's password using a valid reset token.

---

## Verify Email

POST /api/v1/auth/verify-email

Verifies the user's email using an OTP or verification token.

---

# JWT Strategy

Sportora uses:

- Access Token
- Refresh Token

Access Tokens are short-lived.

Refresh Tokens are securely stored and rotated to reduce the impact of token theft.

---

# Authorization

Protected APIs require a valid JWT.

Authorization is enforced using Role-Based Access Control (RBAC).

Supported Roles:

- PLAYER
- ORGANIZER
- ADMIN
- REFEREE
- UMPIRE
- VOLUNTEER
- SPONSOR

---

# Password Security

Passwords are never stored in plain text.

Sportora uses:

- bcrypt hashing
- Salted hashes

---

# Security Features

- JWT Authentication
- Refresh Token Rotation
- HttpOnly Cookies
- Password Hashing
- RBAC
- Input Validation
- Helmet
- CORS
- Secure Environment Variables

---

# Common Error Responses

400 Bad Request

Invalid request payload.

401 Unauthorized

Invalid credentials.

403 Forbidden

Insufficient permissions.

404 Not Found

User not found.

409 Conflict

Email already exists.

500 Internal Server Error

Unexpected server error.

---

# Future Improvements

- Multi-Factor Authentication (MFA)
- Social Login
- Passkeys
- Device Management
- Login History
- Session Dashboard
