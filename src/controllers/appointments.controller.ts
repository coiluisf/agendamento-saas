import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateAppointmentRequest, UpdateAppointmentRequest } from '../models/types';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

async function isTimeSlotAvailable(
  userId: string,
  appointmentDate: Date,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<boolean> {
  const dayOfWeek = appointmentDate.getDay();
  const hours = appointmentDate.getHours().toString().padStart(2, '0');
  const minutes = appointmentDate.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  const availability = await prisma.availability.findUnique({
    where: { userId_dayOfWeek: { userId, dayOfWeek } },
  });

  if (!availability || !availability.isActive) {
    return false;
  }

  if (timeString < availability.startTime || timeString > availability.endTime) {
    return false;
  }

  if (availability.breakStart && availability.breakEnd) {
    if (timeString >= availability.breakStart && timeString < availability.breakEnd) {
      return false;
    }
  }

  const endTime = new Date(appointmentDate);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  const conflicts = await prisma.appointment.count({
    where: {
      userId,
      status: { not: 'cancelled' },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
      appointmentDate: {
        gte: appointmentDate,
        lt: endTime,
      },
    },
  });

  return conflicts === 0;
}

export const createAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { serviceId, clientName, clientPhone, clientEmail, appointmentDate, notes } =
      req.body as CreateAppointmentRequest;

    if (!serviceId || !clientName || !clientPhone || !clientEmail || !appointmentDate) {
      res.status(400).json({
        error: 'Todos os campos são obrigatórios',
      });
      return;
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.userId !== userId) {
      res.status(404).json({ error: 'Serviço não encontrado' });
      return;
    }

    const appointmentDateTime = new Date(appointmentDate);

    if (isNaN(appointmentDateTime.getTime())) {
      res.status(400).json({ error: 'Data/hora inválida' });
      return;
    }

    const isAvailable = await isTimeSlotAvailable(userId!, appointmentDateTime, service.durationMinutes);

    if (!isAvailable) {
      res.status(409).json({
        error: 'Horário não disponível',
      });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: userId!,
        serviceId,
        clientName,
        clientPhone,
        clientEmail,
        appointmentDate: appointmentDateTime,
        notes,
        status: 'pending',
      },
      include: { service: true },
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, startDate, endDate } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) {
        where.appointmentDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.appointmentDate.lte = new Date(endDate as string);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { service: true },
      orderBy: { appointmentDate: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status, notes } = req.body as UpdateAppointmentRequest;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.userId !== userId) {
      res.status(404).json({ error: 'Agendamento não encontrado' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: { service: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.userId !== userId) {
      res.status(404).json({ error: 'Agendamento não encontrado' });
      return;
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json({ message: 'Agendamento cancelado' });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      res.status(400).json({
        error: 'serviceId e date são obrigatórios',
      });
      return;
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId as string },
    });

    if (!service || service.userId !== userId) {
      res.status(404).json({ error: 'Serviço não encontrado' });
      return;
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay();

    const availability = await prisma.availability.findUnique({
      where: { userId_dayOfWeek: { userId: userId!, dayOfWeek } },
    });

    if (!availability || !availability.isActive) {
      res.json([]);
      return;
    }

    const slots: string[] = [];
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);
    let current = new Date(targetDate);
    current.setHours(startHour, startMinute, 0, 0);
    const end = new Date(targetDate);
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
      const timeStr =
        current.getHours().toString().padStart(2, '0') +
        ':' +
        current.getMinutes().toString().padStart(2, '0');

      let inBreak = false;
      if (availability.breakStart && availability.breakEnd) {
        if (timeStr >= availability.breakStart && timeStr < availability.breakEnd) {
          inBreak = true;
        }
      }

      if (!inBreak) {
        slots.push(timeStr);
      }

      current.setMinutes(current.getMinutes() + 30);
    }

    res.json(slots);
  } catch (error) {
    next(error);
  }
};
