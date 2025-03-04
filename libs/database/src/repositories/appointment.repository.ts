import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { Appointment, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentRepository extends BaseRepository<Appointment> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'appointment');
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        professional: true,
      },
    });
  }

  async findByProfessionalId(professionalId: string): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      where: { professionalId },
      include: {
        patient: true,
      },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      where: { status },
      include: {
        patient: true,
        professional: true,
      },
    });
  }
}
