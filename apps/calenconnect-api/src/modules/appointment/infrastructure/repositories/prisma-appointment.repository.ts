import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { AppointmentRepository } from '../../application/ports/out/appointment-repository.interface';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import { AppointmentMapper } from '../mappers/appointment.mapper';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';
import { AppointmentStatus as PrismaAppointmentStatus } from '@prisma/client';

/**
 * Implementación del repositorio de citas utilizando Prisma
 */
@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AppointmentMapper,
  ) {}

  /**
   * Guarda una cita en la base de datos
   */
  async save(appointment: AppointmentEntity): Promise<AppointmentEntity> {
    const prismaAppointment = this.mapper.toPrisma(appointment);
    const saved = await this.prisma.appointment.create({
      data: prismaAppointment,
    });
    return this.mapper.toEntity(saved);
  }

  /**
   * Busca una cita por su ID
   */
  async findById(id: string): Promise<AppointmentEntity | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    return appointment ? this.mapper.toEntity(appointment) : null;
  }

  /**
   * Busca citas por ID del paciente
   */
  async findByPatientId(patientId: string): Promise<AppointmentEntity[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        professional: true,
      },
    });

    return appointments.map((appointment) => this.mapper.toEntity(appointment));
  }

  /**
   * Busca citas por ID del profesional
   */
  async findByProfessionalId(professionalId: string): Promise<AppointmentEntity[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { professionalId },
      include: {
        patient: true,
      },
    });

    return appointments.map((appointment) => this.mapper.toEntity(appointment));
  }

  /**
   * Busca citas por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<AppointmentEntity[]> {
    const appointments = await this.prisma.appointment.findMany({
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

    return appointments.map((appointment) => this.mapper.toEntity(appointment));
  }

  /**
   * Busca citas por estado
   */
  async findByStatus(status: AppointmentStatus): Promise<AppointmentEntity[]> {
    const prismaStatus = status as unknown as PrismaAppointmentStatus;

    const appointments = await this.prisma.appointment.findMany({
      where: { status: prismaStatus },
      include: {
        patient: true,
        professional: true,
      },
    });

    return appointments.map((appointment) => this.mapper.toEntity(appointment));
  }

  /**
   * Actualiza una cita
   */
  async update(id: string, data: Partial<AppointmentEntity>): Promise<AppointmentEntity> {
    // Convertir los datos de la entidad al formato de Prisma
    const updateData: {
      appointmentDate?: Date;
      status?: PrismaAppointmentStatus;
      notes?: string | null;
    } = {};

    if (data.appointmentDate !== undefined) {
      updateData.appointmentDate = data.appointmentDate;
    }

    if (data.status !== undefined) {
      updateData.status = data.status as unknown as PrismaAppointmentStatus;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        professional: true,
      },
    });

    return this.mapper.toEntity(updated);
  }

  /**
   * Elimina una cita
   */
  async delete(id: string): Promise<void> {
    await this.prisma.appointment.delete({
      where: { id },
    });
  }
}
