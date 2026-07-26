import { Router } from 'express';
import { submitGovtId } from '../controllers/organizer.controller.js';

const router = Router();
router.post('/verify/govt-id', submitGovtId);

export default router;
