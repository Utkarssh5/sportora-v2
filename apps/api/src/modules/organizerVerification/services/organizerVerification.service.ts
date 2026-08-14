import {
  VerificationStatus,
  type IOrganizerVerification,
} from "../models/organizerVerification.model.js";

import { organizerVerificationRepository } from "../repositories/organizerVerification.repository.js";

import type { RequestVerificationInput } from "../schemas/requestVerification.schema.js";

export class OrganizerVerificationService {
  async requestVerification(
    organizerId: string,
    data: RequestVerificationInput
  ): Promise<IOrganizerVerification> {
    const existing =
      await organizerVerificationRepository.findByOrganizer(organizerId);

    if (existing) {
      throw new Error("Verification request already exists");
    }

    return organizerVerificationRepository.create({
      organizer: organizerId as any,
      organizationName: data.organizationName,
      governmentId: data.governmentId,
      documentUrl: data.documentUrl,
      status: VerificationStatus.PENDING,
    });
  }

  async myRequest(organizerId: string) {
    const request =
      await organizerVerificationRepository.findByOrganizer(organizerId);

    if (!request) {
      throw new Error("Verification request not found");
    }

    return request;
  }

  async getAllRequests() {
    return organizerVerificationRepository.findAll();
  }

  async approve(
    id: string,
    adminId: string,
    remarks?: string
  ) {
    return organizerVerificationRepository.updateStatus(
      id,
      VerificationStatus.APPROVED,
      adminId,
      remarks
    );
  }

 async reject(
  id: string,
  adminId: string,
  remarks?: string
) {
  return organizerVerificationRepository.updateStatus(
    id,
    VerificationStatus.REJECTED,
    adminId,
    remarks
  );
}
  async isOrganizerApproved(organizerId: string): Promise<boolean> {
    const verification =
      await organizerVerificationRepository.findByOrganizer(organizerId);

    return verification?.status === VerificationStatus.APPROVED;
  }
}

export const organizerVerificationService =
  new OrganizerVerificationService();
