import {
  VenueVerificationStatus,
  type IVenueVerification,
} from "../models/venueVerification.model.js";
import { venueVerificationRepository } from "../repositories/venueVerification.repository.js";
import type { SubmitVenueProofInput } from "../schemas/submitVenueProof.schema.js";

export class VenueVerificationService {
  async createForTournament(
    data: Partial<IVenueVerification>
  ): Promise<IVenueVerification> {
    const existing =
      await venueVerificationRepository.findByTournament(
        data.tournament!.toString()
      );

    if (existing) {
      return existing;
    }

    return venueVerificationRepository.create({
      ...data,
      status: VenueVerificationStatus.PENDING,
    });
  }

  async getByTournament(
    tournamentId: string,
    userId: string,
    role: string
  ) {
    const verification =
      await venueVerificationRepository.findByTournament(tournamentId);

    if (!verification) {
      return null;
    }

    if (
      role !== "ADMIN" &&
      verification.organizer.toString() !== userId
    ) {
      throw new Error(
        "You are not authorized to view this venue verification."
      );
    }

    return verification;
  }

  async submitProof(
    tournamentId: string,
    organizerId: string,
    data: SubmitVenueProofInput
  ) {
    const verification =
      await venueVerificationRepository.findByTournament(tournamentId);

    if (!verification) {
      throw new Error("Venue verification not found.");
    }

    if (verification.organizer.toString() !== organizerId) {
      throw new Error(
        "You are not authorized to update this venue verification."
      );
    }

    if (verification.status === VenueVerificationStatus.APPROVED) {
      throw new Error(
        "Venue verification is already approved."
      );
    }

    return venueVerificationRepository.updateSubmission(
      verification._id.toString(),
      {
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        venuePhotos: data.venuePhotos ?? [],
        venueVideos: data.venueVideos ?? [],
        permissionDocs: data.permissionDocs ?? [],
        venueType: data.venueType,
        bookingStatus: data.bookingStatus,
        proofType: data.proofType,
        ...(data.venueContactName
          ? { venueContactName: data.venueContactName }
          : {}),
        ...(data.venueContactPhone
          ? { venueContactPhone: data.venueContactPhone }
          : {}),
        ...(data.expectedBookingDate
          ? { expectedBookingDate: new Date(data.expectedBookingDate) }
          : {}),
        ...(data.venueCommunication
          ? { venueCommunication: data.venueCommunication }
          : {}),
      }
    );
  }

  async getMyRequests(organizerId: string) {
    return venueVerificationRepository.findByOrganizer(organizerId);
  }

  async getAllRequests() {
    return venueVerificationRepository.findAll();
  }

  async approve(
    id: string,
    adminId: string,
    remarks?: string
  ) {
    return venueVerificationRepository.updateStatus(
      id,
      VenueVerificationStatus.APPROVED,
      adminId,
      remarks
    );
  }

  async requestMoreProof(
    id: string,
    adminId: string,
    remarks: string,
    proofDeadline?: Date
  ) {
    return venueVerificationRepository.updateStatus(
      id,
      VenueVerificationStatus.MORE_PROOF_REQUIRED,
      adminId,
      remarks,
      proofDeadline
    );
  }

  async reject(
    id: string,
    adminId: string,
    remarks?: string
  ) {
    return venueVerificationRepository.updateStatus(
      id,
      VenueVerificationStatus.REJECTED,
      adminId,
      remarks
    );
  }

  async isApproved(tournamentId: string): Promise<boolean> {
    const verification =
      await venueVerificationRepository.findByTournament(
        tournamentId
      );

    return verification?.status === VenueVerificationStatus.APPROVED;
  }
}

export const venueVerificationService =
  new VenueVerificationService();
