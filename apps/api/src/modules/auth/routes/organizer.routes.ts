// Path: apps/api/src/routes/organizer.routes.ts
import { Router } from 'express';
import { submitGovtId } from '../controllers/organizer.controller';

const router = Router();

// Endpoint for submitting govt ID and selfie verification
router.post('/verify/govt-id', submitGovtId);

export default router;