# User Collection

Collection Name: users

Database: MongoDB Atlas

---

# Purpose

Stores every authenticated user of the Sportora platform.

All users belong to this collection.

Different user types are managed using the role field.

---

# Roles

PLAYER

ORGANIZER

ADMIN

REFEREE

VOLUNTEER

SPONSOR

---

# Document Structure

_id

firstName

lastName

username

email

phone

password

role

profilePhoto

coverPhoto

bio

gender

dateOfBirth

country

state

city

address

pincode

isEmailVerified

isPhoneVerified

isProfileCompleted

accountStatus

lastLogin

createdAt

updatedAt

deletedAt

---

# Constraints

email → Unique

username → Unique

phone → Unique

---

# Account Status

ACTIVE

PENDING

BLOCKED

SUSPENDED

DELETED

---

# Authentication

Password will be stored using bcrypt hashing.

JWT Authentication will be used.

Email OTP required.

---

# Relationships

User

↓

OrganizerProfile

↓

OrganizerVerification

↓

Tournament

↓

Registrations

↓

Notifications

---

# Future Fields

preferredSports

language

theme

notificationSettings

aiPreferences

deviceTokens

socialLinks