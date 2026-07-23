import express, { Router } from 'express';
import { body } from 'express-validator';
import userController from '../controllers/user.controller';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// Obter perfil do usuário autenticado
router.get('/me', authenticateToken, userController.getMe.bind(userController));

// Atualizar perfil
router.patch(
  '/profile',
  authenticateToken,
  [
    body('name').optional().notEmpty().trim(),
    body('avatar').optional().isURL(),
  ],
  validateRequest,
  userController.updateProfile.bind(userController)
);

// Alterar senha
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  validateRequest,
  userController.changePassword.bind(userController)
);

// Deletar conta
router.delete(
  '/account',
  authenticateToken,
  userController.deleteAccount.bind(userController)
);

export default router;
