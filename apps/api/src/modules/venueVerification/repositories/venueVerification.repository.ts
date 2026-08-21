import {
  VenueVerification,
  VenueVerificationStatus,
} from "../models/venueVerification.model.js";
import type { IVenueVerification } from "../models/venueVerification.model.js";

export class VenueVerificationRepository {
  async findByTournament(tournamentId: string) {
    return VenueVerification.findOne({ tournament: tournamentId });
  }

  async findByOrganizer(organizerId: string) {
    return VenueVerification.find({ organizer: organizerId })
      .populate("tournament", "title status")
      .sort({ createdAt: -1 });
  }

  async create(data: Partial<IVenueVerification>) {
    return VenueVerification.create(data);
  }

  async updateSubmission(
    id: string,
    data: Partial<IVenueVerification>
  ) {
    return VenueVerification.findByIdAndUpdate(
      id,
      {
        ...data,
        status: VenueVerificationStatus.PENDING,
        remarks: "",
        $unset: {
          proofDeadline: 1,
          reviewedBy: 1,
          reviewedAt: 1,
        },
      },
      { new: true }
    );
  }

  async findAll() {
    return VenueVerification.find()
      .populate("tournament", "title status")
      .populate("organizer", "fullName email")
      .populate("reviewedBy", "fullName email")
      .sort({ createdAt: -1 });
  }

  async updateStatus(
    id: string,
    status: VenueVerificationStatus,
    reviewedBy: string,
    remarks?: string,
    proofDeadline?: Date
  ) {
    return VenueVerification.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        remarks,
        ...(proofDeadline ? { proofDeadline } : {}),
      },
      { new: true }
    );
  }
}

export const venueVerificationRepository =
  new VenueVerificationRepository();
