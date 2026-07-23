import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as availabilityController from '../controllers/availability.controller';

const router = Router();

router.post('/', authenticateToken, availabilityController.setAvailability);
router.get('/', authenticateToken, availabilityController.getAvailability);
router.delete('/:id', authenticateToken, availabilityController.deleteAvailability);

export default router;
