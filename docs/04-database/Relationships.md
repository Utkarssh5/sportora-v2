# Sportora V2 - Database Relationships

Version: 2.0.0

Status: Product Blueprint

Database: MongoDB Atlas

Last Updated: August 2026

---

# 1. Overview

This document defines relationships between MongoDB collections in Sportora V2.

MongoDB uses ObjectId references to connect related documents.

---

# 2. User Relationships

## User → Profile

Relationship:


One User

↓

One Profile


Example:


users._id

    ↓

profiles.userId


Purpose:

Stores additional user information separately from authentication data.

---

## User → Organizer

Relationship:


One User

↓

One Organizer Profile


Example:


users._id

    ↓

organizers.userId


Only users with organizer role can create organizer profiles.

---

## User → Reputation

Relationship:


One User

↓

One Reputation Record


Example:


users._id

    ↓

reputations.userId


---

# 3. Organizer Relationships

## Organizer → Verification

Relationship:


One Organizer

↓

Many Verification Requests


Example:


organizers._id

    ↓

organizerVerifications.organizerId


Reason:

An organizer may request verification multiple times.

---

## Organizer → Tournament

Relationship:


One Organizer

↓

Many Tournaments


Example:


organizers._id

    ↓

tournaments.organizerId


---

# 4. Tournament Relationships

## Tournament → Sport

Relationship:


Many Tournaments

↓

One Sport


Example:


tournaments.sportId

    ↓

sports._id


Example:


Tournament

↓

Badminton


---

## Sport → Tournament Format

Relationship:


One Sport

↓

Many Formats


Example:


sports._id

    ↓

tournamentFormats.sportId


Example:


Badminton

├── Singles

├── Doubles


---

## Tournament → Venue

Relationship:


Many Tournaments

↓

One Venue


Example:


tournaments.venueId

    ↓

venues._id


---

## Tournament → Registration

Relationship:


One Tournament

↓

Many Registrations


Example:


tournaments._id

    ↓

registrations.tournamentId


---

## Tournament → Matches

Relationship:


One Tournament

↓

Many Matches


Example:


tournaments._id

    ↓

matches.tournamentId


---

# 5. Player Relationships

## Player → Tournament Registration

Relationship:


One Player

↓

Many Tournament Registrations


Example:


users._id

    ↓

registrations.playerId


---

## Player → Reviews

Relationship:


One Player

↓

Many Reviews


Example:


users._id

    ↓

reviews.reviewerId


---

# 6. Venue Relationships

## Venue Owner → Venue

Relationship:


One Venue Owner

↓

Many Venues


Example:


users._id

    ↓

venues.ownerId


---

# 7. Payment Relationships

## User → Payments

Relationship:


One User

↓

Many Payments


Example:


users._id

    ↓

payments.userId


---

## Tournament → Payments

Relationship:


One Tournament

↓

Many Payments


Example:


tournaments._id

    ↓

payments.tournamentId


---

# 8. Review Relationships

## Review Target

Reviews can belong to:


Player

Organizer

Venue

Tournament


Relationship:


reviews.targetId

↓

Referenced Entity


---

# 9. Notification Relationships

## User → Notifications

Relationship:


One User

↓

Many Notifications


Example:


users._id

    ↓

notifications.userId


---

# 10. AI Relationships

## User → AI Conversations

Relationship:


One User

↓

Many AI Conversations


Example:


users._id

    ↓

aiConversations.userId


---

# 11. Complete Entity Relationship Overview

                     USERS

                       |

    -------------------------------------

    |              |            |       |

 PROFILE      ORGANIZER    REPUTATION  AI


                   |

                   |

             TOURNAMENTS

                   |

    --------------------------------

    |              |              |

  SPORT          VENUE      REGISTRATIONS

    |

    |

TOURNAMENT FORMATS

REGISTRATIONS

    |

    |

 MATCHES

TOURNAMENTS

    |

    |

PAYMENTS

USERS

    |

    |

REVIEWS

USERS

    |

    |

NOTIFICATIONS


---

# 12. Relationship Design Principles

- Authentication data separated from profile data.
- Large documents are stored separately.
- Frequently accessed data is indexed.
- ObjectId references are used for relationships.
- Avoid unnecessary document nesting.
- Collections should remain scalable.

---

# End of Document