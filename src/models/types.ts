export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  businessPhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  userId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  breakStart?: string;
  breakEnd?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  appointmentDate: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  service?: Service;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  icon?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  icon?: string;
  isActive?: boolean;
}

export interface SetAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface CreateAppointmentRequest {
  serviceId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  appointmentDate: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status?: string;
  notes?: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}
