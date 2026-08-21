import mongoose, { Schema, model, models } from 'mongoose';

// 1. USER SCHEMA
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['PLAYER', 'ORGANIZER', 'COACH', 'SPONSOR', 'ADMIN'], 
    default: 'PLAYER' 
  },
  isVerified: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  sportsPreferences: [{ type: String }],

  playerProfile: {
    skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Pro'], default: 'Beginner' },
    position: { type: String, default: '' },
    achievements: [{ type: String }],
  },
  organizerProfile: {
    organizationName: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    isVerifiedOrganizer: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// 2. NOTIFICATION SCHEMA (Sprint 8)
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['WELCOME', 'TOURNAMENT_REGISTRATION', 'MATCH_REMINDER', 'ANNOUNCEMENT', 'SYSTEM'], 
    default: 'SYSTEM' 
  },
  isRead: { type: Boolean, default: false },
  channel: { type: String, enum: ['IN_APP', 'EMAIL', 'BOTH'], default: 'BOTH' },
  createdAt: { type: Date, default: Date.now }
});

// 3. VERIFICATION REQUEST SCHEMA
const VerificationRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationName: { type: String, required: true },
  panNumber: { type: String, required: true },
  gstNumber: { type: String },
  documentUrl: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  rejectionReason: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

// 4. TOURNAMENT SCHEMA
const TournamentSchema = new Schema({
  title: { type: String, required: true },
  sport: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  entryFee: { type: Number, required: true },
  prizePool: { type: String, required: true },
  rules: { type: String, default: 'Standard Tournament Rules Apply' },
  skillLevel: { type: String, enum: ['All', 'Beginner', 'Intermediate', 'Pro'], default: 'All' },
  maxTeams: { type: Number, default: 16 },
  status: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' },
  organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  registeredTeams: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// 5. REGISTRATION SCHEMA
const RegistrationSchema = new Schema({
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teamName: { type: String, required: true },
  playerCount: { type: Number, default: 1 },
  contactPhone: { type: String, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'REFUNDED'], default: 'COMPLETED' },
  registeredAt: { type: Date, default: Date.now }
});

// 6. BOOKING SCHEMA
const BookingSchema = new Schema({
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  playerName: { type: String, required: true },
  phone: { type: String, required: true },
  teamName: { type: String },
  amountPaid: { type: String, required: true },
  paymentStatus: { type: String, default: 'COMPLETED' },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 7. FIXTURES SCHEMA
const FixtureSchema = new Schema({
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  roundName: { type: String, required: true },
  matches: [{
    matchId: { type: String },
    team1: { type: String },
    team2: { type: String },
    winner: { type: String, default: '' },
    score: { type: String, default: '0 - 0' },
    status: { type: String, enum: ['SCHEDULED', 'LIVE', 'FINISHED'], default: 'SCHEDULED' }
  }],
  createdAt: { type: Date, default: Date.now }
});

// 8. OTP & REFRESH SCHEMAS
const OTPSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }
});

const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 604800 }
});

export const User = models.User || model('User', UserSchema);
export const Notification = models.Notification || model('Notification', NotificationSchema);
export const VerificationRequest = models.VerificationRequest || model('VerificationRequest', VerificationRequestSchema);
export const Tournament = models.Tournament || model('Tournament', TournamentSchema);
export const Registration = models.Registration || model('Registration', RegistrationSchema);
export const Booking = models.Booking || model('Booking', BookingSchema);
export const Fixture = models.Fixture || model('Fixture', FixtureSchema);
export const OTP = models.OTP || model('OTP', OTPSchema);
export const RefreshToken = models.RefreshToken || model('RefreshToken', RefreshTokenSchema);
