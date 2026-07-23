import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as appointmentsController from '../controllers/appointments.controller';

const router = Router();

router.post('/', authenticateToken, appointmentsController.createAppointment);
router.get('/', authenticateToken, appointmentsController.getAppointments);
router.get('/slots/available', authenticateToken, appointmentsController.getAvailableSlots);
router.put('/:id', authenticateToken, appointmentsController.updateAppointment);
router.delete('/:id', authenticateToken, appointmentsController.deleteAppointment);

export default router;
