import type { Request, Response } from 'express';
import { OrganizerModel, VerificationStep, VerificationStatus } from '../models/organizer.model.js';

export const submitGovtId = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId; 
    const { govtIdType, govtIdNumber, govtIdDocumentUrl, selfieUrl } = req.body;

    let organizer = await OrganizerModel.findOne({ userId });

    if (organizer) {
       return res.status(400).json({ success: false, message: 'Verification already in progress or completed.' });
    }

    organizer = await OrganizerModel.create({
      userId,
      govtIdType,
      govtIdNumber,
      govtIdDocumentUrl,
      selfieUrl,
      currentStep: VerificationStep.GOVT_ID_SUBMITTED,
      status: VerificationStatus.PENDING
    });

    res.status(201).json({
      success: true,
      message: 'Government ID and Selfie submitted successfully. Proceed to next step.',
      data: organizer
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
