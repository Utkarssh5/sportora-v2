# Sportora V2 - Database Collections

Version: 2.0.0
Status: Current Database Architecture
Last Updated: August 2026

---

# 1. Database Overview

Sportora V2 currently uses MongoDB Atlas as its primary database.

The database is accessed through Mongoose models inside the backend modules.

The current database model set is based on the implemented backend architecture.

---

# 2. Current Collections

The current primary collections are:

- users
- tournaments
- tournamentregistrations
- competitionentries
- payments
- organizerverifications
- venueverifications
- matches
- crews
- tournamentcrewassignments
- aiconversations
- aimessages

---

# 3. User Collection

Model: User

Collection: users

Stores the primary account and user identity.

Responsibilities:

- Authentication identity
- User information
- Contact information
- Role information
- Account status
- User-related profile data

Public registration supports PLAYER and ORGANIZER.

ADMIN is controlled separately and is not a freely selectable public registration role.

---

# 4. Tournament Collection

Model: Tournament

Collection: tournaments

Stores tournament information and lifecycle state.

Important fields include:

- organizerId
- title
- sport
- format
- type
- competitionType
- competitionRules
- city
- state
- locationName
- pincode
- venuePhotos
- venueVideos
- permissionDocs
- startDate
- endDate
- registrationDeadline
- maxParticipants
- registeredParticipants
- entryFee
- prizePool
- sponsors
- status

Current statuses:

- DRAFT
- PENDING_APPROVAL
- APPROVED
- ONGOING
- COMPLETED
- CANCELLED


---

# 5. Tournament Registration Collection

Model: TournamentRegistration

Collection: tournamentregistrations

Represents a user's registration for a tournament.

Important fields:

- tournamentId
- userId
- status
- registeredAt
- ticketId

Tournament registration is separate from Competition Entry.

---

# 6. Competition Entry Collection

Model: CompetitionEntry

Collection: competitionentries

Represents the actual competitive unit participating in a tournament.

Competition types include:

- SINGLES
- DOUBLES
- MIXED_DOUBLES
- TEAM
- RELAY

Important fields include:

- tournamentId
- registrationId
- captainId
- competitionType
- displayName
- participants
- teamSheetUrl
- status
- rejectionReason
- submittedAt
- approvedAt

Current statuses:

- PENDING_DETAILS
- SUBMITTED
- APPROVED
- REJECTED

Participant roles:

- CAPTAIN
- PLAYER
- SUBSTITUTE

---

# 7. Payment Collection

Model: Payment

Collection: payments

Stores payment information associated with tournament registration.

The payment module integrates with Razorpay.

Typical lifecycle:

Create Order
↓
Payment
↓
Payment Verification
↓
Registration Confirmation

Payment data is treated as sensitive financial information.

---

# 8. Organizer Verification Collection

Model: OrganizerVerification

Collection: organizerverifications

Stores organizer verification information.

Important fields may include:

- organizer
- organizationName
- governmentId
- governmentIdType
- documentUrl
- address
- city
- state
- pincode
- status
- remarks
- reviewedBy
- reviewedAt

Current statuses:

- PENDING
- APPROVED
- REJECTED

Approved organizer verification is required before tournament creation.


---

# 9. Venue Verification Collection

Model: VenueVerification

Collection: venueverifications

Stores verification information for tournament venues.

Evidence may include:

- Venue details
- Address
- City
- State
- Pincode
- Photos
- Videos
- Permission documents
- Verification status
- Review information

Venue verification is separate from organizer verification.

---

# 10. Match Collection

Model: Match

Collection: matches

Stores tournament matches and competitive results.

Supports:

- Fixture information
- Tournament reference
- Participants
- Match state
- Results
- Winner information
- Round information
- Match progression

The currently verified fixture implementation primarily supports knockout progression.

---

# 11. Crew Collection

Model: Crew

Collection: crews

Stores tournament operational crew information.

Crew can represent:

- Officials
- Volunteers
- Ground staff
- Other configured tournament roles

---

# 12. Tournament Crew Assignment Collection

Model: TournamentCrewAssignment

Collection: tournamentcrewassignments

Connects crew members with tournaments.

This allows tournament-specific crew assignments without duplicating crew identity data.


---

# 9. Venue Verification Collection

Model: VenueVerification

Collection: venueverifications

Stores verification information for tournament venues.

Evidence may include:

- Venue details
- Address
- City
- State
- Pincode
- Photos
- Videos
- Permission documents
- Verification status
- Review information

Venue verification is separate from organizer verification.

---

# 10. Match Collection

Model: Match

Collection: matches

Stores tournament matches and competitive results.

Supports:

- Fixture information
- Tournament reference
- Participants
- Match state
- Results
- Winner information
- Round information
- Match progression

The currently verified fixture implementation primarily supports knockout progression.

---

# 11. Crew Collection

Model: Crew

Collection: crews

Stores tournament operational crew information.

Crew can represent:

- Officials
- Volunteers
- Ground staff
- Other configured tournament roles

---

# 12. Tournament Crew Assignment Collection

Model: TournamentCrewAssignment

Collection: tournamentcrewassignments

Connects crew members with tournaments.

This allows tournament-specific crew assignments without duplicating crew identity data.


---

# 13. AI Conversation Collection

Model: AIConversation

Collection: aiconversations

Stores AI conversation sessions and conversation context.

---

# 14. AI Message Collection

Model: AIMessage

Collection: aimessages

Stores individual messages belonging to AI conversations.

---

# 15. Sport Configuration

The Sports module currently provides sport and competition configuration through backend configuration.

A separate MongoDB sports collection should not be assumed unless a persistent Sport model is implemented.

The configuration follows:

SPORT
↓
COMPETITION TYPE
↓
COMPETITION RULES
↓
FORMAT

---

# 16. Competition Rules

Competition rules are associated with tournament configuration.

Important rule concepts include:

- participantCount
- requiresRoster
- defaultPlayingSize
- allowsSubstitutes
- requiresMixedGender

Tournament-specific competition rules are stored with the tournament so existing tournaments remain stable if global sport configuration changes.

---

# 17. Tournament Type Compatibility

The Tournament model currently contains legacy tournament type values:

- SOLO
- DUO
- TEAM

These remain for compatibility with existing tournament and fixture logic.

Preferred domain architecture:

SPORT
↓
COMPETITION TYPE
↓
PARTICIPANT / ENTRY
↓
ROSTER RULES
↓
TOURNAMENT FORMAT

New functionality should follow this architecture rather than unnecessarily expanding the legacy type system.

---

# 18. Collection Relationship Overview

Major relationships include:

User
↓
Tournament Registration
↓
Tournament

Tournament Registration
↓
Competition Entry

User
↓
Organizer Verification

Tournament
↓
Venue Verification

Tournament
↓
Matches

Tournament
↓
Tournament Crew Assignment
↓
Crew

AI Conversation
↓
AI Message

Tournament
↓
Payment / Registration Flow

---

# 19. Current Database Boundary

The following are NOT current primary collections unless corresponding models are implemented:

- Profile
- Organizer profile
- Standalone Venue
- Reviews
- Reputation
- Notifications
- Sponsors
- Advertisements
- Certificates
- Analytics
- Tournament Formats as a separate collection
- Sports as a separate collection

These may be future concepts but should not be documented as current collections without an actual model.

---

# 20. Database Design Principles

Sportora V2 database design follows these principles:

- Implemented models are the source of truth.
- Tournament registration is separate from competition entry.
- Organizer verification is separate from venue verification.
- Payment logic is separate from registration state.
- Tournament-specific competition rules are stored with the tournament.
- Existing working functionality must be preserved.
- Avoid duplicate collections for existing domain models.
- Add new collections only when corresponding functionality is implemented.

---

# 21. Current Source of Truth

The authoritative model location is:

apps/api/src/modules/*/models/*.model.ts

Documentation should be updated whenever actual models, fields, relationships, or lifecycle states change.

---

# End of Document
