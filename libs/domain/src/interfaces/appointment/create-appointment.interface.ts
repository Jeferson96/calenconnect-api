import { AppointmentStatus } from '@prisma/client';

export interface ICreateAppointment {
  patientId: string;
  professionalId: string;
  appointmentDate: Date;
  status: AppointmentStatus;
}
