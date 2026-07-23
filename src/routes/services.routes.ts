import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as servicesController from '../controllers/services.controller';

const router = Router();

router.post('/', authenticateToken, servicesController.createService);
router.get('/', authenticateToken, servicesController.getServices);
router.put('/:id', authenticateToken, servicesController.updateService);
router.delete('/:id', authenticateToken, servicesController.deleteService);

export default router;
