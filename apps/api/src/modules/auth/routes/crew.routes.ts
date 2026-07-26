cat << 'EOF' > src/routes/crew.routes.ts
import { Router } from 'express';
import { registerCrew, getAvailableCrew } from '../controllers/crew.controller.js';

const router = Router();

router.post('/register', registerCrew);
router.get('/search', getAvailableCrew);

export default router;
EOF