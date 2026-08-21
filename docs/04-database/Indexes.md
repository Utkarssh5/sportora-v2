# Sportora V2 - Database Indexes

Version: 2.0.0

Status: Product Blueprint

Database: MongoDB Atlas

Last Updated: August 2026

---

# 1. Overview

Indexes improve database query performance and help Sportora handle large-scale data efficiently.

Indexes are created based on:

- Search patterns
- Filtering requirements
- Sorting operations
- Relationship lookups

---

# 2. Users Collection Indexes

Collection:


users


## Email Index

Purpose:

Fast login and duplicate prevention.

```javascript
{
 email: 1
}

Type:

Unique Index

Role Index

Purpose:

Find users based on role.

Example:

Players
Organizers
Admins
{
 role: 1
}
Status Index

Purpose:

Filter active and blocked users.

{
 status: 1
}
3. Profiles Collection Indexes

Collection:

profiles
User Reference Index

Purpose:

Fast profile lookup.

{
 userId: 1
}

Type:

Unique Index

Location Index

Purpose:

Location-based search.

{
 city: 1,
 state: 1
}
4. Organizer Collection Indexes

Collection:

organizers
User Reference Index
{
 userId: 1
}

Unique Index

Verification Status Index

Purpose:

Admin verification management.

{
 verificationStatus: 1
}
5. Tournament Collection Indexes

Collection:

tournaments

Tournament is the most frequently searched entity.

Sport Index

Purpose:

Find tournaments by sport.

{
 sportId: 1
}
Location Index

Purpose:

Nearby tournament discovery.

{
 "location.city": 1,
 "location.state": 1
}
Date Index

Purpose:

Upcoming tournament search.

{
 startDate: 1
}
Status Index

Purpose:

Filter tournament lifecycle.

{
 status: 1
}
Combined Search Index

For player discovery:

{
 sportId: 1,
 city: 1,
 startDate: 1,
 status: 1
}
6. Registration Collection Indexes

Collection:

registrations
Tournament Lookup Index

Purpose:

Find all participants.

{
 tournamentId: 1
}
Player Lookup Index

Purpose:

Find player's registrations.

{
 playerId: 1
}
Unique Registration Index

Prevents duplicate registration.

{
 tournamentId: 1,
 playerId: 1
}

Type:

Unique Compound Index

7. Match Collection Indexes

Collection:

matches
Tournament Match Index

Purpose:

Fetch tournament schedule.

{
 tournamentId: 1
}
Match Status Index
{
 status: 1
}
8. Venue Collection Indexes

Collection:

venues
Owner Index
{
 ownerId: 1
}
Location Search Index
{
 city: 1
}
Sport Availability Index
{
 sportsAvailable: 1
}
9. Payment Collection Indexes

Collection:

payments
User Payment History
{
 userId: 1
}
Tournament Payment Index
{
 tournamentId: 1
}
Transaction Lookup
{
 transactionId: 1
}

Unique Index

10. Review Collection Indexes

Collection:

reviews
Target Reviews

Purpose:

Get ratings of organizer/tournament/venue.

{
 targetId: 1
}
Reviewer History
{
 reviewerId: 1
}
11. Reputation Collection Indexes

Collection:

reputations
User Reputation Lookup
{
 userId: 1
}

Unique Index

12. Notification Collection Indexes

Collection:

notifications
User Notification Index

Purpose:

Fetch user notifications.

{
 userId: 1,
 createdAt: -1
}
Unread Notification Index
{
 userId: 1,
 isRead: 1
}
13. AI Conversation Collection Indexes

Collection:

aiConversations
User AI History
{
 userId: 1,
 createdAt: -1
}
14. Indexing Strategy Rules
Create indexes only for frequent queries.
Avoid unnecessary indexes.
Monitor query performance.
Use compound indexes for combined filters.
Review indexes as data grows.
End of Document

Save kar de bhai.

Uske baad:

✅ Database Design  
✅ Collections  
✅ Relationships  
✅ Indexes  

**Database module complete ho jayega.**

Next phir hum jayenge:

```bash
docs/03-architecture