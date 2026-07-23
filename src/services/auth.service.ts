import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthenticationError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, name: string, password: string) {
    // Validar entrada
    if (!email || !name || !password) {
      throw new ValidationError('Email, name, and password are required');
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
      },
    });

    // Gerar token
    const token = this.generateToken(user.id, user.email, 'user');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Validar entrada
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Gerar token
    const token = this.generateToken(user.id, user.email, 'user');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async refreshToken(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const token = this.generateToken(user.id, user.email, 'user');

    return {
      token,
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'default_secret_change_in_production';
    const expiresIn = process.env.JWT_EXPIRE || '24h';

    return jwt.sign(
      {
        id: userId,
        email,
        role,
      },
      secret,
      { expiresIn } as SignOptions
    );
  }
}

export default new AuthService();
