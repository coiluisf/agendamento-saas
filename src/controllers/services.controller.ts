import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateServiceRequest, UpdateServiceRequest } from '../models/types';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const createService = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, description, durationMinutes, price, icon } = req.body as CreateServiceRequest;

    if (!name || !durationMinutes) {
      res.status(400).json({
        error: 'Nome e duração do serviço são obrigatórios',
      });
      return;
    }

    if (durationMinutes < 15 || durationMinutes > 480) {
      res.status(400).json({
        error: 'Duração deve estar entre 15 e 480 minutos',
      });
      return;
    }

    const service = await prisma.service.create({
      data: {
        userId: userId!,
        name,
        description,
        durationMinutes,
        price: price || 0,
        icon,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { isActive } = req.query;

    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(services);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body as UpdateServiceRequest;

    const service = await prisma.service.findUnique({ where: { id } });

    if (!service || service.userId !== userId) {
      res.status(404).json({ error: 'Serviço não encontrado' });
      return;
    }

    const updated = await prisma.service.update({
      where: { id },
      data: updates,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const service = await prisma.service.findUnique({ where: { id } });

    if (!service || service.userId !== userId) {
      res.status(404).json({ error: 'Serviço não encontrado' });
      return;
    }

    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentCount > 0) {
      res.status(400).json({
        error: 'Não é possível deletar serviço com agendamentos',
      });
      return;
    }

    await prisma.service.delete({ where: { id } });

    res.json({ message: 'Serviço deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};
