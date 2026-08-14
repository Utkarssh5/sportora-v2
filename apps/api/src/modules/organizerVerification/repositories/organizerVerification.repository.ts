import {
  OrganizerVerification,
  VerificationStatus,
} from "../models/organizerVerification.model.js";

import type { IOrganizerVerification } from "../models/organizerVerification.model.js";
  
  export class OrganizerVerificationRepository {
    async findByOrganizer(organizerId: string) {
      return OrganizerVerification.findOne({
        organizer: organizerId,
      });
    }
  
    async create(data: Partial<IOrganizerVerification>) {
      return OrganizerVerification.create(data);
    }
  
    async findAll() {
      return OrganizerVerification.find()
        .populate("organizer", "fullName email")
        .populate("reviewedBy", "fullName email");
    }
  
    async findById(id: string) {
      return OrganizerVerification.findById(id);
    }
  
    async updateStatus(
      id: string,
      status: VerificationStatus,
      reviewedBy: string,
      remarks?: string
    ) {
      return OrganizerVerification.findByIdAndUpdate(
        id,
        {
          status,
          reviewedBy,
          reviewedAt: new Date(),
          remarks,
        },
        {
          new: true,
        }
      );
    }
  }
  
  export const organizerVerificationRepository =
    new OrganizerVerificationRepository();
