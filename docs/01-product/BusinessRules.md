# Sportora V2 - Business Rules

Version: 2.0.0  
Status: Current Product Workflow  
Last Updated: August 2026

---

# 1. Overview

Sportora is a connected sports ecosystem for:

- Players
- Organizers
- Venues
- Ground Crew
- Administrators

The platform separates account registration, organizer verification, venue verification, tournament registration, competition participation, payment, fixtures, matches, and results.

---

# 2. Account Rules

## 2.1 User Registration

Every platform user must create an account before accessing authenticated platform functionality.

A user account contains:

- Full name
- Email
- Password
- Optional phone
- Role

Email must be unique.

---

## 2.2 Public Roles

Public registration supports normal platform roles such as:

- PLAYER
- ORGANIZER

ADMIN must not be freely selectable through public registration.

Administrative accounts are provisioned through controlled administrative processes.

---

# 3. Authentication Rules

Users must authenticate before performing protected actions.

Protected actions include:

- Registering for tournaments
- Making payments
- Updating participation details
- Creating tournaments
- Reviewing competition entries
- Administrative operations

The platform uses access and refresh token authentication.

---

# 4. Organizer Rules

## 4.1 Organizer Registration

An organizer must provide additional verification information.

Required organizer verification information can include:

- Organization name
- Government ID type
- Government ID
- Supporting document
- Address
- City
- State
- Pincode

Creating an organizer account does not automatically mean the organizer is trusted.

---

## 4.2 Organizer Verification

Organizer verification is required before tournament creation.

Verification states include:

- PENDING
- UNDER_REVIEW
- APPROVED
- REJECTED

Only approved organizers may create tournaments.

Admin controls the approval decision.

---

# 5. Tournament Creation Rules

Only authorized organizers may create tournaments.

Before creation, the organizer must have approved organizer verification.

The system also prevents an organizer from creating another active tournament when the configured active-tournament restriction applies.

---

# 6. Tournament Data Rules

A tournament can contain:

- Title
- Sport
- Competition type
- Format
- Location
- City
- State
- Pincode
- Venue photos
- Venue videos
- Permission documents
- Start date
- End date
- Registration deadline
- Maximum participants
- Entry fee
- Prize pool
- Sponsors
- Status

---

# 7. Sport and Competition Rules

Sport configuration is the canonical source for allowed competition types and formats.

Competition types include:

- SINGLES
- DOUBLES
- MIXED_DOUBLES
- TEAM
- RELAY

A tournament cannot use a competition type that is not allowed for its selected sport.

A tournament cannot use a format that is not allowed for its selected sport and competition type.

---

# 8. Competition Rule Snapshot

When a tournament is created, the applicable competition rules are stored with the tournament.

This snapshot can contain:

- Participant count
- Roster requirement
- Default playing size
- Substitute rules
- Mixed-gender requirement

This prevents future global sport configuration changes from silently modifying an existing tournament.

---

# 9. Legacy Compatibility

The platform currently retains the legacy tournament `type` field for compatibility with existing tournament, fixture, registration, and payment functionality.

Canonical competition classification is:

SPORT
→ COMPETITION TYPE
→ COMPETITION RULES
→ FORMAT

Legacy mapping:

SINGLES → SOLO

DOUBLES / MIXED_DOUBLES → DUO

TEAM / RELAY → TEAM

The legacy field must remain synchronized with the canonical competition type where applicable.

---

# 10. Tournament Approval Rules

New tournaments are subject to the tournament approval workflow.

Tournament states include:

- DRAFT
- PENDING_APPROVAL
- APPROVED
- ONGOING
- COMPLETED
- CANCELLED

Only approved tournaments should enter the public competition lifecycle.

---

# 11. Venue Verification Rules

Tournament creation automatically establishes a venue verification requirement.

Venue verification is separate from organizer verification.

Venue verification may contain:

- Venue name
- Venue address
- City
- State
- Pincode
- Venue photos
- Venue videos
- Permission documents

Venue proof may include:

- Booking proof
- Permission proof
- NOC
- Quotation
- Other credible venue arrangement evidence

---

# 12. AI Pre-screening Rules

Tournament proposals may be evaluated by the AI pre-screening layer.

AI may produce:

- Risk score
- Risk analysis

AI is an assisting layer only.

AI cannot replace:

- Admin approval
- Financial authorization
- Human governance
- Verification decisions

---

# 13. Tournament Registration Rules

Players may register only when the tournament permits registration.

Registration must respect:

- Registration deadline
- Participant capacity
- Tournament state
- Payment requirement

The system must maintain accurate registration counts.

---

# 14. Payment Rules

Paid tournaments require payment verification before successful paid registration.

Payment flow:

CREATE ORDER
→ PAYMENT
→ PAYMENT VERIFICATION
→ REGISTRATION CONFIRMATION

Payment records must be maintained independently from registration records.

A failed or unverified payment must not be treated as a successful paid registration.

---

# 15. Registration and Competition Entry Separation

Tournament registration and competition participation are separate concepts.

Registration establishes that a player has entered the tournament.

Competition Entry establishes the actual competitive unit participating in the tournament.

This separation supports:

- Singles
- Doubles
- Mixed Doubles
- Team
- Relay

---

# 16. Competition Entry Rules

A Competition Entry contains:

- Tournament
- Registration
- Captain
- Competition type
- Display name
- Participants
- Participant roles
- Team sheet where applicable
- Status

Participant roles include:

- CAPTAIN
- PLAYER
- SUBSTITUTE

---

# 17. Competition Entry States

Competition entries can have:

- PENDING_DETAILS
- SUBMITTED
- APPROVED
- REJECTED

Singles entries can be automatically approved when no additional participation details are required.

Other competition types normally require participation details before approval.

---

# 18. Participation Detail Rules

Only the registration captain can update participation details.

Participation details may include:

- Display name
- Players
- Captain
- Player roles
- Substitutes
- Team sheet URL

Validation includes:

- Captain must be present
- Exactly one captain
- No duplicate players
- Selected players must exist
- Player cannot belong to another entry in the same tournament
- Competition-specific participant limits
- Competition-specific playing size
- Substitute restrictions

---

# 19. Save Draft Rules

Participation details can be saved without final submission.

Draft state:

PENDING_DETAILS

Saving a draft does not make the entry available for organizer approval.

The captain may continue editing the draft while participation details remain editable.

---

# 20. Submission Rules

When the captain submits participation details, final validation is performed.

Successful submission changes:

PENDING_DETAILS
→ SUBMITTED

The entry then becomes eligible for organizer review.

---

# 21. Organizer Competition Review

Only the tournament organizer or authorized ADMIN may review competition entries.

Submitted entries may be:

- APPROVED
- REJECTED

Rejection requires a reason.

Approval changes:

SUBMITTED
→ APPROVED

Rejection changes:

SUBMITTED
→ REJECTED

---

# 22. Deadline Rules

Participation details are locked after the tournament registration deadline.

Attempts to modify participation details after the deadline must be rejected.

---

# 23. Fixture Rules

Fixture generation depends on:

- Tournament approval/state
- Competition type
- Tournament format
- Valid competition entries
- Tournament registration conditions

The fixture engine creates matches according to the configured tournament format.

---

# 24. Match Rules

Matches belong to tournaments and competition participants.

For knockout tournaments:

MATCH
→ RESULT
→ WINNER
→ NEXT MATCH

The match service is responsible for progression and completion handling.

---

# 25. Tournament Completion

A tournament can become COMPLETED after its competition is completed according to the configured fixture and match flow.

Completed results contribute to participant performance.

---

# 26. Player Performance Rules

Player performance may include:

- Matches played
- Wins
- Losses
- Win rate
- Tournament history
- Podiums
- Placement

Possible placement values include:

- CHAMPION
- RUNNER_UP

Performance contributes to the player's profile and achievement system.

---

# 27. Reputation Rules

Reputation may consider platform activity.

Player reputation may consider:

- Participation
- Completion rate
- Reviews
- Sportsmanship

Organizer reputation may consider:

- Successful tournaments
- Cancellation rate
- Player ratings
- Transparency

Reputation improves visibility but should not automatically replace authorization or verification.

---

# 28. Review Rules

Reviews should represent genuine participation or experience.

Reviews may be submitted after participation.

Reviews must follow platform community guidelines.

---

# 29. Cancellation Rules

Tournaments may be cancelled by authorized organizers or administrators according to platform permissions.

Cancellation reason must be recorded.

Affected participants should receive appropriate notifications when notification infrastructure is enabled.

---

# 30. Admin Rules

Admin functionality is controlled separately from public registration.

ADMIN permissions may include:

- Organizer verification
- Venue verification
- Tournament approval
- User management
- Tournament oversight
- Moderation
- Governance
- Other sensitive platform operations

Users cannot manually assign themselves ADMIN privileges.

---

# 31. Security Rules

Users may access only resources permitted by their identity and role.

Sensitive operations require authorization.

Examples:

- Only tournament owner can update their tournament
- Only organizer/admin can review competition entries
- Only registration captain can modify participation details
- Only approved organizers can create tournaments
- Admin-only actions require ADMIN authorization

---

# 32. Data Integrity Rules

The system must maintain:

- Unique user emails
- Valid tournament data
- Correct registration counts
- Correct payment records
- Valid competition entries
- No duplicate participants within an entry
- No participant conflict across entries in the same tournament
- Valid tournament sport/competition/format combinations

---

# 33. AI Governance

AI may:

- Recommend
- Analyze
- Assist
- Pre-screen
- Automate supporting workflows

AI must not independently:

- Approve organizers
- Approve venues
- Approve tournaments
- Make final financial decisions
- Override administrative governance

---

# 34. Core Product Principle

The platform should not treat every tournament as simply SOLO, DUO, or TEAM.

The canonical architecture is:

SPORT
↓
COMPETITION TYPE
↓
COMPETITION RULES
↓
PARTICIPATION / ENTRY
↓
ROSTER
↓
TOURNAMENT FORMAT
↓
FIXTURE
↓
MATCH
↓
RESULT
↓
ACHIEVEMENT

This architecture allows Sportora to support different sports and competition structures without rebuilding the tournament system for every sport.

---

# End of Document

# 5. Tournament Creation Rules

Only authorized organizers may create tournaments.

Before creation, the organizer must have approved organizer verification.

The system also prevents an organizer from creating another active tournament when the configured active-tournament restriction applies.

---

# 6. Tournament Data Rules

A tournament can contain:

- Title
- Sport
- Competition type
- Format
- Location
- City
- State
- Pincode
- Venue photos
- Venue videos
- Permission documents
- Start date
- End date
- Registration deadline
- Maximum participants
- Entry fee
- Prize pool
- Sponsors
- Status

---

# 7. Sport and Competition Rules

Sport configuration is the canonical source for allowed competition types and formats.

Competition types include:

- SINGLES
- DOUBLES
- MIXED_DOUBLES
- TEAM
- RELAY

A tournament cannot use a competition type that is not allowed for its selected sport.

A tournament cannot use a format that is not allowed for its selected sport and competition type.

---

# 8. Competition Rule Snapshot

When a tournament is created, the applicable competition rules are stored with the tournament.

This snapshot can contain:

- Participant count
- Roster requirement
- Default playing size
- Substitute rules
- Mixed-gender requirement

This prevents future global sport configuration changes from silently modifying an existing tournament.

---

# 9. Legacy Compatibility

The platform currently retains the legacy tournament `type` field for compatibility with existing tournament, fixture, registration, and payment functionality.

Canonical competition classification is:

SPORT
→ COMPETITION TYPE
→ COMPETITION RULES
→ FORMAT

Legacy mapping:

SINGLES → SOLO

DOUBLES / MIXED_DOUBLES → DUO

TEAM / RELAY → TEAM

The legacy field must remain synchronized with the canonical competition type where applicable.

---

# 10. Tournament Approval Rules

New tournaments are subject to the tournament approval workflow.

Tournament states include:

- DRAFT
- PENDING_APPROVAL
- APPROVED
- ONGOING
- COMPLETED
- CANCELLED

Only approved tournaments should enter the public competition lifecycle.

---

# 11. Venue Verification Rules

Tournament creation automatically establishes a venue verification requirement.

Venue verification is separate from organizer verification.

Venue verification may contain:

- Venue name
- Venue address
- City
- State
- Pincode
- Venue photos
- Venue videos
- Permission documents

Venue proof may include:

- Booking proof
- Permission proof
- NOC
- Quotation
- Other credible venue arrangement evidence

---

# 12. AI Pre-screening Rules

Tournament proposals may be evaluated by the AI pre-screening layer.

AI may produce:

- Risk score
- Risk analysis

AI is an assisting layer only.

AI cannot replace:

- Admin approval
- Financial authorization
- Human governance
- Verification decisions

---

# 13. Tournament Registration Rules

Players may register only when the tournament permits registration.

Registration must respect:

- Registration deadline
- Participant capacity
- Tournament state
- Payment requirement

The system must maintain accurate registration counts.

---

# 14. Payment Rules

Paid tournaments require payment verification before successful paid registration.

Payment flow:

CREATE ORDER
→ PAYMENT
→ PAYMENT VERIFICATION
→ REGISTRATION CONFIRMATION

Payment records must be maintained independently from registration records.

A failed or unverified payment must not be treated as a successful paid registration.

---

# 15. Registration and Competition Entry Separation

Tournament registration and competition participation are separate concepts.

Registration establishes that a player has entered the tournament.

Competition Entry establishes the actual competitive unit participating in the tournament.

This separation supports:

- Singles
- Doubles
- Mixed Doubles
- Team
- Relay

---

# 16. Competition Entry Rules

A Competition Entry contains:

- Tournament
- Registration
- Captain
- Competition type
- Display name
- Participants
- Participant roles
- Team sheet where applicable
- Status

Participant roles include:

- CAPTAIN
- PLAYER
- SUBSTITUTE

---

# 17. Competition Entry States

Competition entries can have:

- PENDING_DETAILS
- SUBMITTED
- APPROVED
- REJECTED

Singles entries can be automatically approved when no additional participation details are required.

Other competition types normally require participation details before approval.

---

# 18. Participation Detail Rules

Only the registration captain can update participation details.

Participation details may include:

- Display name
- Players
- Captain
- Player roles
- Substitutes
- Team sheet URL

Validation includes:

- Captain must be present
- Exactly one captain
- No duplicate players
- Selected players must exist
- Player cannot belong to another entry in the same tournament
- Competition-specific participant limits
- Competition-specific playing size
- Substitute restrictions

---

# 19. Save Draft Rules

Participation details can be saved without final submission.

Draft state:

PENDING_DETAILS

Saving a draft does not make the entry available for organizer approval.

The captain may continue editing the draft while participation details remain editable.

---

# 20. Submission Rules

When the captain submits participation details, final validation is performed.

Successful submission changes:

PENDING_DETAILS
→ SUBMITTED

The entry then becomes eligible for organizer review.

---

# 21. Organizer Competition Review

Only the tournament organizer or authorized ADMIN may review competition entries.

Submitted entries may be:

- APPROVED
- REJECTED

Rejection requires a reason.

Approval changes:

SUBMITTED
→ APPROVED

Rejection changes:

SUBMITTED
→ REJECTED

---

# 22. Deadline Rules

Participation details are locked after the tournament registration deadline.

Attempts to modify participation details after the deadline must be rejected.

---

# 23. Fixture Rules

Fixture generation depends on:

- Tournament approval/state
- Competition type
- Tournament format
- Valid competition entries
- Tournament registration conditions

The fixture engine creates matches according to the configured tournament format.

---

# 24. Match Rules

Matches belong to tournaments and competition participants.

For knockout tournaments:

MATCH
→ RESULT
→ WINNER
→ NEXT MATCH

The match service is responsible for progression and completion handling.

---

# 25. Tournament Completion

A tournament can become COMPLETED after its competition is completed according to the configured fixture and match flow.

Completed results contribute to participant performance.

---

# 26. Player Performance Rules

Player performance may include:

- Matches played
- Wins
- Losses
- Win rate
- Tournament history
- Podiums
- Placement

Possible placement values include:

- CHAMPION
- RUNNER_UP

Performance contributes to the player's profile and achievement system.

---

# 27. Reputation Rules

Reputation may consider platform activity.

Player reputation may consider:

- Participation
- Completion rate
- Reviews
- Sportsmanship

Organizer reputation may consider:

- Successful tournaments
- Cancellation rate
- Player ratings
- Transparency

Reputation improves visibility but should not automatically replace authorization or verification.

---

# 28. Review Rules

Reviews should represent genuine participation or experience.

Reviews may be submitted after participation.

Reviews must follow platform community guidelines.

---

# 29. Cancellation Rules

Tournaments may be cancelled by authorized organizers or administrators according to platform permissions.

Cancellation reason must be recorded.

Affected participants should receive appropriate notifications when notification infrastructure is enabled.

---

# 30. Admin Rules

Admin functionality is controlled separately from public registration.

ADMIN permissions may include:

- Organizer verification
- Venue verification
- Tournament approval
- User management
- Tournament oversight
- Moderation
- Governance
- Other sensitive platform operations

Users cannot manually assign themselves ADMIN privileges.

---

# 31. Security Rules

Users may access only resources permitted by their identity and role.

Sensitive operations require authorization.

Examples:

- Only tournament owner can update their tournament
- Only organizer/admin can review competition entries
- Only registration captain can modify participation details
- Only approved organizers can create tournaments
- Admin-only actions require ADMIN authorization

---

# 32. Data Integrity Rules

The system must maintain:

- Unique user emails
- Valid tournament data
- Correct registration counts
- Correct payment records
- Valid competition entries
- No duplicate participants within an entry
- No participant conflict across entries in the same tournament
- Valid tournament sport/competition/format combinations

---

# 33. AI Governance

AI may:

- Recommend
- Analyze
- Assist
- Pre-screen
- Automate supporting workflows

AI must not independently:

- Approve organizers
- Approve venues
- Approve tournaments
- Make final financial decisions
- Override administrative governance

---

# 34. Core Product Principle

The platform should not treat every tournament as simply SOLO, DUO, or TEAM.

The canonical architecture is:

SPORT
↓
COMPETITION TYPE
↓
COMPETITION RULES
↓
PARTICIPATION / ENTRY
↓
ROSTER
↓
TOURNAMENT FORMAT
↓
FIXTURE
↓
MATCH
↓
RESULT
↓
ACHIEVEMENT

This architecture allows Sportora to support different sports and competition structures without rebuilding the tournament system for every sport.

---

# End of Document
