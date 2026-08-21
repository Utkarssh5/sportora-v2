# Database Design

# Sportora V2

Database: MongoDB Atlas

Version: 2.0.0

Last Updated: August 2026

---

# 1. Database Overview

Sportora uses MongoDB Atlas as the primary database.

MongoDB is selected because:

- Flexible schema design
- Dynamic tournament structures
- Scalable document storage
- Easy Node.js integration
- Support for AI generated data
- Cloud-native architecture


---

# 2. Database Strategy

Sportora follows a modular collection-based architecture.

Principles:

- Separate collections for major entities
- ObjectId references between collections
- Soft delete support
- Audit logging
- Created and updated timestamps
- Indexed search fields


---

# 3. Naming Convention

## Collections

Collections use plural lowercase names.

Examples:
users

tournaments

registrations

payments

venues



## Fields

camelCase naming convention.

Examples:


firstName

phoneNumber

createdAt

updatedAt


---

# 4. Core Collections

Sportora database contains following primary collections:


users

profiles

organizers

organizerVerifications

tournaments

sports

tournamentFormats

registrations

matches

venues

payments

reviews

reputations

notifications

sponsors

advertisements

aiConversations


---

# 5. User Collection

Purpose:

Stores authentication and account information.

Collection:


users


Main fields:


_id

firstName

lastName

email

passwordHash

role

status

isVerified

createdAt

updatedAt



Role examples:


PLAYER

ORGANIZER

ADMIN

REFEREE

VOLUNTEER

VENUE_OWNER

SPONSOR


---

# 6. Profile Collection

Purpose:

Stores additional user information.

Fields:


userId

profileImage

age

gender

city

state

sportsInterest

skillLevel

achievements


---

# 7. Organizer Collection

Purpose:

Stores organizer-specific information.

Fields:


userId

organizationName

experience

previousEvents

rating

verificationStatus


---

# 8. Organizer Verification Collection

Purpose:

Stores verification requests.

Fields:


organizerId

documents

proofImages

status

reviewedBy

reviewedAt


Status:


PENDING

UNDER_REVIEW

APPROVED

REJECTED


---

# 9. Tournament Collection

Purpose:

Main sports event entity.

Fields:


organizerId

name

sportId

formatId

category

location

venueId

startDate

endDate

registrationDeadline

entryFee

maxParticipants

status

createdAt


Tournament status:


DRAFT

PUBLISHED

REGISTRATION_OPEN

REGISTRATION_CLOSED

ONGOING

COMPLETED

CANCELLED


---

# 10. Sport Collection

Purpose:

Dynamic sport management.

Example:


Cricket

Football

Badminton

Chess


Fields:


name

description

formats


---

# 11. Tournament Format Collection

Purpose:

Stores sport-specific formats.

Example:

Cricket:


T10

T20

Knockout


Badminton:


Singles

Doubles



Fields:


sportId

name

rules


---

# 12. Registration Collection

Purpose:

Stores player participation.

Fields:


tournamentId

playerId

teamId

paymentStatus

registrationStatus

registeredAt


---

# 13. Match Collection

Purpose:

Stores tournament matches.

Fields:


tournamentId

players

teams

schedule

result

status


---

# 14. Venue Collection

Purpose:

Stores sports facilities.

Fields:


ownerId

name

address

city

sportsAvailable

images

availability


---

# 15. Payment Collection

Purpose:

Stores financial transactions.

Fields:


userId

tournamentId

amount

platformFee

organizerAmount

paymentStatus

transactionId


---

# 16. Review Collection

Purpose:

Stores user feedback.

Fields:


reviewerId

targetId

rating

comment

createdAt


---

# 17. Reputation Collection

Purpose:

Stores trust score.

Fields:


userId

score

participations

successfulEvents

ratings

badges


---

# 18. Notification Collection

Purpose:

Stores system notifications.

Fields:


userId

title

message

type

readStatus


---

# 19. AI Conversation Collection

Purpose:

Stores AI interactions.

Fields:


userId

agentType

messages

createdAt


Examples:


Tournament Finder

Organizer Assistant

Support Agent


---

# 20. Relationships

Main relationships:


User

|

|-- Organizer

|-- Profile

|-- Reputation

|-- Registrations

Organizer

|

|-- Tournaments

Tournament

|

|-- Registrations

|-- Matches

|-- Payments

Venue

|

|-- Tournaments


---

# 21. Future Collections

Possible future additions:


sponsorships

stadiumBookings

liveScores

certificates

analytics


---

# End of Document