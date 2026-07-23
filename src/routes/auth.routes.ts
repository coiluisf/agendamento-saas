import express, { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// Registro de novo usuário
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').notEmpty().trim(),
    body('password').isLength({ min: 6 }),
  ],
  validateRequest,
  authController.register.bind(authController)
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  authController.login.bind(authController)
);

// Refresh token
router.post(
  '/refresh',
  authenticateToken,
  authController.refreshToken.bind(authController)
);

export default router;
