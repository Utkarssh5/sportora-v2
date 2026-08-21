# Sportora V2 - System Architecture

Version: 2.0.0
Status: Current Architecture
Last Updated: August 2026

---

# 1. Architecture Overview

Sportora V2 follows a Modular Monolith architecture.

The backend runs as a single Node.js / Express application containing independent business modules.

The frontend is a Next.js application.

Current flow:

USER
↓
Next.js Web Application
↓
Express REST API
↓
Business Modules
↓
MongoDB Atlas

External services are connected through backend modules.

---

# 2. Application Structure

The platform contains:

- `apps/web` — Next.js frontend
- `apps/api` — Node.js + Express + TypeScript backend

The frontend handles:

- User interface
- Authentication interaction
- Tournament discovery
- Tournament registration
- Payment interaction
- Participation details
- Organizer workflows
- Admin workflows
- Profile and results

The backend handles:

- Authentication
- Authorization
- Business rules
- Validation
- Tournament management
- Registration
- Competition entries
- Payments
- Verification
- Matches and fixtures
- AI integration
- Database access


---

# 3. Backend Architecture

The backend follows a modular business-domain structure.

Current modules:

- auth
- users
- sports
- tournaments
- tournamentRegistration
- competitionEntry
- payment
- organizerVerification
- venueVerification
- match
- crew
- ai
- demo

Each module may contain:

- Controllers
- Models
- Repositories
- Routes
- Schemas
- Services

Not every module requires every directory.

---

# 4. Authentication Module

The Authentication module manages:

- User registration
- Login
- Password verification
- Access tokens
- Refresh tokens
- Authentication state
- Role information

Public registration supports PLAYER and ORGANIZER.

ADMIN must not be freely selectable through public registration.

---

# 5. User Module

The User module manages the primary user entity.

Responsibilities include:

- User information
- Profile-related information
- Player information
- User updates
- User-related business operations

The User model is the primary account entity.

---

# 6. Sports Module

The Sports module provides configurable sport and competition information.

The canonical architecture is:

SPORT
↓
COMPETITION TYPE
↓
COMPETITION RULES
↓
FORMAT

Examples:

Football → TEAM

Badminton → SINGLES / DOUBLES / MIXED_DOUBLES

Table Tennis → SINGLES / DOUBLES / MIXED_DOUBLES / TEAM

The tournament system does not require separate tournament implementations for every sport.


---

# 7. Tournament Module

The Tournament module manages:

- Tournament creation
- Tournament updates
- Tournament retrieval
- Tournament status
- Sport
- Competition type
- Competition rules
- Tournament format
- Registration deadline
- Capacity
- Entry fee
- Prize pool
- Venue information
- AI screening information
- Tournament crew assignments

When a tournament is created, the applicable competition rules are stored with the tournament.

This protects an existing tournament from unexpected changes to global sport configuration.

---

# 8. Organizer Verification Module

The Organizer Verification module manages organizer verification.

Workflow:

Organizer Registration
↓
Verification Record
↓
PENDING
↓
Admin Review
↓
APPROVED / REJECTED

Verification information may include:

- Organization name
- Government ID
- Government ID type
- Supporting documents
- Address
- City
- State
- Pincode

Only approved organizers should be allowed to create tournaments.

---

# 9. Venue Verification Module

Venue verification is separate from organizer verification.

Tournament creation can create a venue verification requirement.

Venue information may include:

- Venue name
- Address
- City
- State
- Pincode
- Photos
- Videos
- Permission documents

Venue verification provides evidence that the proposed tournament venue is valid.

---

# 10. Tournament Registration Module

The Tournament Registration module manages player registration.

The basic relationship is:

PLAYER
↓
TOURNAMENT
↓
TOURNAMENT REGISTRATION

For paid tournaments:

Registration
↓
Payment
↓
Payment Verification
↓
Registration Confirmed

Registration and competition participation are separate concepts.


---

# 11. Competition Entry Module

Competition Entry represents the actual competitive unit participating in a tournament.

Supported competition types include:

- SINGLES
- DOUBLES
- MIXED_DOUBLES
- TEAM
- RELAY

Entry lifecycle:

PENDING_DETAILS
↓
SUBMITTED
↓
APPROVED

Alternative:

SUBMITTED
↓
REJECTED
↓
Correct Details
↓
Resubmit

The module manages captains, participants, participant roles, substitutes where allowed, display names, team sheets and validation.

---

# 12. Save Draft Workflow

Participation details can be saved before final submission.

PENDING_DETAILS
↓
SAVE DRAFT
↓
Continue Editing
↓
SUBMIT

The captain can continue editing while the entry remains editable and before the applicable deadline.

---

# 13. Payment Module

The Payment module handles tournament payment operations.

Typical flow:

Create Order
↓
Payment Gateway
↓
Payment Verification
↓
Registration Confirmation

Payment processing remains separate from competition participation logic.

---

# 14. Match and Fixture Module

The Match module manages:

- Fixture generation
- Match creation
- Match participants
- Match results
- Winner advancement
- Tournament completion

For knockout tournaments:

Fixture
↓
Match
↓
Result
↓
Winner
↓
Next Match

The currently verified fixture engine primarily supports knockout tournament progression.

---

# 15. Crew Module

The Crew module manages tournament crew.

Crew can represent operational roles such as:

- Officials
- Volunteers
- Ground staff
- Other configured tournament roles

Tournament-level crew assignments connect crew members with tournaments.

---

# 16. AI Module

The AI module manages AI-related functionality.

Responsibilities include:

- AI conversations
- AI messages
- AI tools
- AI-assisted workflows
- Tournament pre-screening

AI pre-screening may provide:

- Risk score
- Risk analysis

AI remains an advisory system.

AI must not independently replace:

- Admin approval
- Organizer verification
- Venue verification
- Financial authorization
- Platform governance

---

# 17. Admin Architecture

Admin functionality is protected separately from public registration.

ADMIN is not a freely selectable public registration role.

Admin operations may include:

- Organizer verification
- Venue verification
- Tournament approval
- User oversight
- Tournament oversight
- Governance
- Sensitive platform operations

Authorization is enforced by the backend.

---

# 18. Complete Organizer Flow

ORGANIZER
↓
Organizer Registration
↓
Organizer Verification
↓
Admin Approval
↓
Create Tournament
↓
Sport Selection
↓
Competition Type
↓
Competition Rules
↓
Format
↓
Venue Details
↓
Venue Verification
↓
AI Pre-screening
↓
Tournament Approval
↓
APPROVED
↓
Public Tournament Lifecycle

---

# 19. Complete Player Flow

PLAYER
↓
Register / Login
↓
Discover Tournament
↓
Register
↓
Payment if required
↓
Registration Confirmed
↓
Competition Entry
↓
Participation Details
↓
Save Draft
↓
Submit
↓
Organizer Review
↓
APPROVED
↓
Fixture
↓
Match
↓
Result
↓
Profile / Achievement

---

# 20. Data Layer

MongoDB Atlas is the primary database.

Current backend models include:

- User
- Tournament
- TournamentRegistration
- CompetitionEntry
- Payment
- OrganizerVerification
- VenueVerification
- Match
- Crew
- TournamentCrewAssignment
- AIConversation
- AIMessage

---

# 21. External Integrations

Current architecture can integrate with external services through backend modules.

Examples include:

- MongoDB Atlas
- Razorpay
- Google Gemini / AI services
- Email infrastructure

Future infrastructure such as Redis, S3, SMS, or additional notification providers should only be treated as active dependencies once implemented and configured.

---

# 22. Security Principles

The backend enforces:

- Authentication
- Role-based authorization
- Ownership checks
- Input validation
- Business rule validation
- Payment verification
- Participant validation
- Admin authorization

Frontend visibility is not considered sufficient security.

---

# 23. Architectural Principles

Sportora V2 follows these principles:

- Modular
- API-driven
- Secure
- Domain-oriented
- Configurable
- Maintainable
- Incremental
- Scalable

Existing working functionality should be preserved while new functionality is added incrementally.

---

# 24. Future Evolution

The current Modular Monolith can later be separated into independent services if scale requires it.

Potential future service boundaries include:

- Authentication
- Tournament
- Registration
- Competition
- Payment
- Verification
- Match
- Notification
- AI

Microservices are a future scaling option and are not required by the current architecture.

---

# End of Document
