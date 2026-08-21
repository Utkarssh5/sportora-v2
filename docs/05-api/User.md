# 👤 User Module

## Overview

The User Module manages user profiles, account information, preferences, and role-specific details across the Sportora platform.

Each registered account belongs to one of the supported roles and has an associated profile.

---

# Features

- View Profile
- Update Profile
- Change Password
- Upload Profile Picture
- Role Management
- Account Verification Status
- Sports Preferences
- City & State
- Public Profile

---

# Supported Roles

- PLAYER
- ORGANIZER
- ADMIN
- REFEREE
- UMPIRE
- VOLUNTEER
- SPONSOR

---

# Endpoints

## Get Profile

GET /api/v1/users/profile

Returns the authenticated user's profile.

---

## Update Profile

PUT /api/v1/users/profile

Updates user information.

Example Request

```json
{
  "fullName": "Utkarsh Tripathi",
  "phone": "9876543210",
  "city": "Jaipur",
  "state": "Rajasthan",
  "bio": "Cloud & DevOps Enthusiast"
}
```

---

## Upload Profile Image

POST /api/v1/users/profile/image

Uploads a profile image.

---

## Change Password

PUT /api/v1/users/change-password

Allows authenticated users to update their password.

---

# Profile Fields

- Full Name
- Email
- Phone
- Role
- City
- State
- Bio
- Sports
- Profile Image
- Verification Status

---

# Security

- Authentication Required
- JWT Protected
- RBAC Enabled
- Input Validation
- Ownership Validation

---

# Common Errors

400 Bad Request

401 Unauthorized

403 Forbidden

404 User Not Found

500 Internal Server Error

---

# Future Improvements

- Social Profiles
- Achievement Badges
- Skill Rating
- Player Statistics
- Organizer Reputation
- Coach Profiles
