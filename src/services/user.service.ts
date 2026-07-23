import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        businessName: true,
        businessType: true,
        businessPhoto: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUser(id: string, data: { name?: string; phone?: string; businessName?: string }) {
    if (!data.name && !data.phone && !data.businessName) {
      throw new ValidationError('At least one field is required');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.businessName && { businessName: data.businessName }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        businessName: true,
        businessType: true,
        businessPhoto: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async deleteUser(id: string) {
    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}

export default new UserService();
