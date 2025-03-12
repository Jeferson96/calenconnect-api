import { Injectable } from '@nestjs/common';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import { Appointment, AppointmentStatus as PrismaAppointmentStatus } from '@prisma/client';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';
import { AppointmentResponseDto } from '../dtos/appointment-response.dto';

interface PrismaAppointmentData {
  id?: string;
  patientId: string;
  professionalId: string;
  appointmentDate: Date;
  status: PrismaAppointmentStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mapeador para convertir entre diferentes representaciones de la cita
 */
@Injectable()
export class AppointmentMapper {
  /**
   * Convierte un modelo de Prisma a una entidad de dominio
   */
  toEntity(prismaAppointment: Appointment): AppointmentEntity {
    return new AppointmentEntity({
      id: prismaAppointment.id,
      patientId: prismaAppointment.patientId,
      professionalId: prismaAppointment.professionalId,
      appointmentDate: prismaAppointment.appointmentDate,
      status: prismaAppointment.status as unknown as AppointmentStatus,
      notes:
        'notes' in prismaAppointment
          ? (prismaAppointment['notes'] as string | undefined)
          : undefined,
      createdAt: prismaAppointment.createdAt,
      updatedAt: prismaAppointment.updatedAt,
    });
  }

  /**
   * Convierte una entidad de dominio a un modelo de Prisma
   */
  toPrisma(entity: AppointmentEntity): PrismaAppointmentData {
    // Extraemos solo las propiedades que conocemos que existen en Prisma
    const result: PrismaAppointmentData = {
      id: entity.id,
      patientId: entity.patientId,
      professionalId: entity.professionalId,
      appointmentDate: entity.appointmentDate,
      status: entity.status as unknown as PrismaAppointmentStatus,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Añadimos notes solo si existe en la entidad
    if (entity.notes !== undefined) {
      result.notes = entity.notes || null;
    }

    return result;
  }

  /**
   * Convierte una entidad de dominio a un DTO de respuesta
   */
  toResponseDto(entity: AppointmentEntity): AppointmentResponseDto {
    const dto = new AppointmentResponseDto();
    dto.id = entity.id!;
    dto.patientId = entity.patientId;
    dto.professionalId = entity.professionalId;
    dto.appointmentDate = entity.appointmentDate.toISOString();
    // Convertimos el tipo de forma más segura
    dto.status = entity.status as unknown as AppointmentStatus;
    if (entity.notes !== undefined) {
      dto.notes = entity.notes;
    }
    dto.createdAt = entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString();
    dto.updatedAt = entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString();
    return dto;
  }
}
