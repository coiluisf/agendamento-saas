import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { SetAvailabilityRequest } from '../models/types';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const setAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { dayOfWeek, startTime, endTime, breakStart, breakEnd } = req.body as SetAvailabilityRequest;

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      res.status(400).json({ error: 'Dia da semana inválido (0-6)' });
      return;
    }

    if (!startTime || !endTime) {
      res.status(400).json({ error: 'Horários de início e fim são obrigatórios' });
      return;
    }

    const existing = await prisma.availability.findUnique({
      where: {
        userId_dayOfWeek: { userId: userId!, dayOfWeek },
      },
    });

    let availability;

    if (existing) {
      availability = await prisma.availability.update({
        where: { id: existing.id },
        data: { startTime, endTime, breakStart, breakEnd },
      });
    } else {
      availability = await prisma.availability.create({
        data: {
          userId: userId!,
          dayOfWeek,
          startTime,
          endTime,
          breakStart,
          breakEnd,
        },
      });
    }

    res.json(availability);
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const availability = await prisma.availability.findMany({
      where: { userId, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json(availability);
  } catch (error) {
    next(error);
  }
};

export const deleteAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const availability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!availability || availability.userId !== userId) {
      res.status(404).json({ error: 'Disponibilidade não encontrada' });
      return;
    }

    await prisma.availability.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Disponibilidade removida' });
  } catch (error) {
    next(error);
  }
};
