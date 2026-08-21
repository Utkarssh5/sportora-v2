# Sportora V2 - User Roles

Version: 2.0.0

Status: Product Blueprint

Last Updated: August 2026

---

# 1. Overview

Sportora supports multiple user roles to create a complete sports ecosystem.

Each role has specific responsibilities, permissions, and workflows.

---

# 2. Player

## Description

A player is the primary participant who discovers and joins sports tournaments.

## Goals

- Find nearby tournaments
- Participate in competitions
- Track performance
- Build sports reputation


## Permissions

Can:

- Create account
- Manage profile
- Select sports interests
- Search tournaments
- Filter tournaments
- Register for tournaments
- Make payments
- View match schedules
- Receive notifications
- Submit reviews
- Build reputation


Cannot:

- Create tournaments
- Manage other users
- Access organizer tools


---

# 3. Organizer

## Description

Organizer creates and manages sports tournaments.

## Goals

- Host successful tournaments
- Manage participants
- Promote events
- Earn revenue


## Permissions

Can:

- Create organizer profile
- Create tournaments
- Edit tournaments
- Manage registrations
- View participants
- Manage payments
- Generate tournament information
- Request verification
- View analytics


Cannot:

- Approve own verification
- Manage platform settings


---

# 4. Verified Organizer

## Description

A trusted organizer approved by Sportora.

Verified organizers receive additional visibility and trust.

## Benefits

- Verified badge
- Higher search visibility
- Priority support
- Advanced analytics
- Additional AI credits
- Featured profile


## Additional Permissions

Can:

- Access premium organizer features
- Use advanced AI tools
- Promote tournaments


---

# 5. Venue Owner

## Description

A venue owner manages sports facilities and infrastructure.

## Goals

- Increase venue utilization
- Receive tournament bookings


## Permissions

Can:

- Create venue profile
- Add venue details
- Upload images
- Manage availability
- Accept booking requests
- Receive reviews


---

# 6. Referee / Official

## Description

A referee manages match operations and ensures fair gameplay.

## Permissions

Can:

- Create official profile
- Add experience
- Accept match assignments
- Update match information
- Receive ratings


---

# 7. Volunteer

## Description

Volunteers help organizers during tournaments.

## Permissions

Can:

- Create volunteer profile
- Apply for events
- Accept tasks
- Manage assigned responsibilities
- Build reputation


---

# 8. Sponsor

## Description

Sponsors promote their brands through sports events.

## Permissions

Can:

- Create sponsor profile
- Browse tournaments
- Sponsor events
- Create advertisements
- Manage campaigns


---

# 9. Admin

## Description

Admin manages the complete Sportora platform.

## Responsibilities

- User management
- Organizer verification
- Tournament moderation
- Payment monitoring
- Report handling
- Security management


## Permissions

Can:

- Manage all users
- Approve/reject verification
- Remove harmful content
- Manage disputes
- Access analytics
- Configure platform settings


---

# 10. AI Agent

## Description

AI agents assist users and automate platform workflows.

## AI Roles

### AI Tournament Finder

Helps players discover suitable tournaments.

### AI Organizer Assistant

Helps organizers create and manage tournaments.

### AI Fixture Generator

Creates tournament schedules and brackets.

### AI Support Assistant

Handles user queries and support.


---

# 11. Role Hierarchy
                ADMIN

                  |

    ----------------------------

    |            |             |
    ORGANIZER VENUE OWNER SPONSOR

    |

VERIFIED ORGANIZER

    |

  PLAYER


    |

    REFEREE / VOLUNTEER


---

# 12. Permission Principles

- Users can only access features according to their role.
- Sensitive operations require authorization.
- Admin approval is required for verification.
- Reputation affects visibility but does not restrict participation.

---

# End of Document

Save kar de.

Uske baad next file hum BusinessRules.md update karenge, kyunki roles ke baad rules lock karna zaroori hai. 🚀