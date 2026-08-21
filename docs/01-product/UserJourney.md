# Sportora V2 - User Journey

Version: 2.0.0  
Status: Current Product Workflow  
Last Updated: August 2026

---

# 1. Platform Overview

Sportora connects players, organizers, venues, ground crew, and administrators through one sports ecosystem.

The core platform journey is:

PLAYER
→ Discover Tournament
→ Register
→ Payment (if required)
→ Competition Entry
→ Participation Details
→ Organizer Review
→ Fixture
→ Match
→ Result
→ Achievement

ORGANIZER
→ Register
→ Organizer Verification
→ Admin Approval
→ Create Tournament
→ Venue Verification
→ AI Pre-screening
→ Admin Tournament Approval
→ Tournament Registration
→ Competition Entries
→ Fixture
→ Match Management
→ Results

ADMIN
→ Controlled Login
→ Organizer Verification
→ Venue Verification
→ Tournament Approval
→ User / Tournament Oversight
→ Governance

---

# 2. Player Journey

## Step 1 - Account Registration

A player creates an account using the public registration flow.

Default public role:

- PLAYER

Required account information may include:

- Full name
- Email
- Password
- Phone number

Admin is not a selectable public registration role.

---

## Step 2 - Login

The player logs into Sportora.

Successful login provides:

- Access token
- Refresh token
- User profile
- User role

Authenticated platform features become available after login.

---

# 3. Tournament Discovery

Players can discover tournaments through:

- Sport
- Competition type
- City
- State
- Search
- Tournament listing

Examples of competition types:

- Singles
- Doubles
- Mixed Doubles
- Team
- Relay

The platform uses sport-specific configuration instead of hardcoding one tournament structure.

---

# 4. Tournament Registration

A player can register only when the tournament permits registration.

Registration is subject to:

- Tournament availability
- Registration deadline
- Participant capacity
- Payment requirement

For paid tournaments:

PLAYER
→ Payment Order
→ Payment Gateway
→ Payment Verification
→ Registration Confirmation

For free tournaments:

PLAYER
→ Registration
→ Registration Confirmation

---

# 5. Competition Entry

Tournament registration and competition participation details are separate concepts.

After registration, the system can create a Competition Entry.

Initial states:

PENDING_DETAILS

For singles competitions, the registered player can be automatically approved because no additional roster is required.

For doubles/team/relay competitions, participation details are required.

---

# 6. Participation Details

The registration captain can provide:

- Display name / team name
- Participants
- Captain
- Player roles
- Substitutes where allowed
- Team sheet URL where applicable

The system validates:

- Duplicate players
- Existing users
- Captain presence
- Captain count
- Competition-specific participant count
- Team playing size
- Substitute rules
- Player conflicts within the tournament

A player cannot participate in multiple entries in the same tournament.

---

# 7. Save Draft

Participation details do not have to be submitted immediately.

The captain can:

SAVE DRAFT

and continue later.

Draft status:

PENDING_DETAILS

Draft data can include:

- Team / pair name
- Selected players
- Player roles
- Team sheet

The draft remains editable until submission or the relevant deadline.

---

# 8. Submit Participation Details

When the captain is satisfied with the entry:

SUBMIT DETAILS

The system performs final validation.

Successful submission changes the entry to:

SUBMITTED

The entry is then available for organizer review.

---

# 9. Organizer Review of Competition Entry

The tournament organizer can review submitted competition entries.

Possible actions:

- APPROVE
- REJECT

Approved entry:

SUBMITTED
→ APPROVED

Rejected entry:

SUBMITTED
→ REJECTED

A rejection reason is required.

The captain can correct rejected participation details and submit them again.

---

# 10. Fixture Generation

Only valid/approved competition entries should participate in the competition fixture flow.

Fixture generation depends on:

- Sport
- Competition type
- Tournament format
- Approved entries
- Tournament state

Examples:

- Knockout
- League
- Other configured formats

The fixture engine handles match creation and progression.

---

# 11. Match Journey

A tournament progresses through generated matches.

Typical flow:

FIXTURE
→ MATCH
→ RESULT
→ WINNER ADVANCEMENT
→ NEXT MATCH

For knockout tournaments, winners advance through the bracket.

The final completed match can result in tournament completion.

---

# 12. Results and Achievements

After matches are completed, player performance can contribute to:

- Matches played
- Wins
- Losses
- Win rate
- Tournament history
- Podium placement
- Achievements

Possible tournament placements include:

- CHAMPION
- RUNNER_UP
- Other configured placements

These results contribute to the user's profile and sports journey.

---

# 13. Organizer Journey

## Step 1 - Organizer Registration

A user can request organizer access through the public registration flow.

Organizer registration collects additional verification information such as:

- Organization name
- Government ID type
- Government ID
- Supporting document
- Address
- City
- State
- Pincode

The system creates an Organizer Verification record.

Initial status:

PENDING

---

# 14. Organizer Verification

Organizer verification is required before tournament creation.

Verification lifecycle:

PENDING
→ UNDER_REVIEW
→ APPROVED / REJECTED

Only an approved organizer can create tournaments.

Admin controls the final approval decision.

---

# 15. Tournament Creation

An approved organizer can create a tournament.

Tournament creation includes:

- Tournament name
- Sport
- Competition type
- Format
- Location
- City
- State
- Pincode
- Tournament dates
- Registration deadline
- Maximum participants
- Entry fee
- Prize pool
- Rules
- Venue information
- Venue photos
- Venue videos
- Permission documents

The system validates the sport + competition type + format combination.

---

# 16. Competition Configuration

Sport configuration defines which competition types are allowed.

Examples:

Football:

- Team

Badminton:

- Singles
- Doubles
- Mixed Doubles

Table Tennis:

- Singles
- Doubles
- Mixed Doubles
- Team

The selected competition rules are snapshotted into the tournament.

This prevents future configuration changes from silently changing existing tournaments.

---

# 17. Venue Verification

Creating a tournament does not automatically mean the venue is trusted.

A venue verification record is created for the tournament.

Venue evidence may include:

- Venue name
- Address
- City
- State
- Pincode
- Venue photos
- Venue videos
- Permission documents
- Booking / permission proof

Venue verification is handled separately from organizer verification.

---

# 18. AI Pre-screening

Tournament proposals can pass through an AI pre-screening layer.

The AI can provide:

- Risk score
- Risk analysis

AI screening assists the platform but does not replace administrative approval.

---

# 19. Tournament Approval

The tournament remains subject to the platform's approval workflow.

Administrative operations can include:

- Review tournament
- Review organizer
- Review venue
- Approve
- Reject
- Monitor

Only approved tournaments should become available for the intended public competition lifecycle.

---

# 20. Tournament Lifecycle

Current tournament states include:

DRAFT
→ PENDING_APPROVAL
→ APPROVED
→ ONGOING
→ COMPLETED

A tournament may also become:

CANCELLED

Cancellation must be controlled and recorded.

---

# 21. Admin Journey

Admin access is controlled separately from public user registration.

ADMIN
→ Controlled Login
→ Admin Dashboard

Admin responsibilities include:

- Organizer verification
- Venue verification
- Tournament approval
- User oversight
- Tournament oversight
- Governance
- Moderation
- Sensitive operational actions

Users cannot promote themselves to ADMIN through normal registration.

---

# 22. Payment Journey

For paid tournaments:

PLAYER
→ Create Payment Order
→ Payment Gateway
→ Payment Verification
→ Registration Confirmation
→ Ticket / Registration Details

Payment records are maintained separately from tournament registration records.

Payment verification must occur before a paid registration is treated as successfully completed.

---

# 23. Registration + Participation Model

Sportora intentionally separates:

REGISTRATION

from:

COMPETITION ENTRY

This allows the platform to support:

- Singles
- Doubles
- Mixed Doubles
- Team
- Relay

without forcing every tournament into the same participant structure.

---

# 24. Complete Player Flow

REGISTER
↓
LOGIN
↓
DISCOVER TOURNAMENT
↓
REGISTER
↓
PAYMENT (IF REQUIRED)
↓
REGISTRATION CONFIRMED
↓
COMPETITION ENTRY
↓
SAVE PARTICIPATION DETAILS
↓
SUBMIT
↓
ORGANIZER REVIEW
↓
APPROVED
↓
FIXTURE
↓
MATCH
↓
RESULT
↓
ACHIEVEMENT / PROFILE

---

# 25. Complete Organizer Flow

REGISTER AS ORGANIZER
↓
ORGANIZER VERIFICATION
↓
ADMIN REVIEW
↓
ORGANIZER APPROVED
↓
CREATE TOURNAMENT
↓
SPORT + COMPETITION + FORMAT VALIDATION
↓
VENUE VERIFICATION
↓
AI PRE-SCREENING
↓
TOURNAMENT APPROVAL
↓
TOURNAMENT APPROVED
↓
REGISTRATIONS
↓
COMPETITION ENTRIES
↓
ENTRY REVIEW
↓
FIXTURE
↓
MATCH MANAGEMENT
↓
RESULTS
↓
TOURNAMENT COMPLETION

---

# 26. Complete Admin Flow

CONTROLLED ADMIN ACCESS
↓
ADMIN DASHBOARD
↓
ORGANIZER VERIFICATION
↓
VENUE VERIFICATION
↓
TOURNAMENT APPROVAL
↓
USER / TOURNAMENT OVERSIGHT
↓
MODERATION / GOVERNANCE

---

# End of Document
