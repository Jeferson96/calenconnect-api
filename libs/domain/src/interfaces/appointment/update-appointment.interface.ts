import { AppointmentStatus } from '@prisma/client';

export interface IUpdateAppointment {
  appointmentDate?: Date;
  status?: AppointmentStatus;
}
