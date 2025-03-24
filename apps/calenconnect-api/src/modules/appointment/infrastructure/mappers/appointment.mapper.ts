import { Injectable } from '@nestjs/common';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import { Appointment, AppointmentStatus as PrismaAppointmentStatus } from '@prisma/client';
import { AppointmentResponseDto } from '../dtos/appointment-response.dto';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';

// Extendemos el tipo de Prisma para incluir el campo availabilityId
interface PrismaAppointment extends Appointment {
  availabilityId: string;
}

// Define un tipo para el resultado de Prisma con las propiedades que necesitamos
interface PrismaAppointmentData {
  id?: string;
  patientId: string;
  professionalId: string;
  availabilityId: string;
  appointmentDate: Date;
  status: PrismaAppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mapeador para convertir entre diferentes representaciones de citas
 */
@Injectable()
export class AppointmentMapper {
  /**
   * Convierte un modelo de Prisma a una entidad de dominio
   */
  toEntity(prismaAppointment: Appointment): AppointmentEntity {
    // Usamos type assertion para indicar que el modelo incluye availabilityId
    const appointmentWithAvailability = prismaAppointment as PrismaAppointment;

    return new AppointmentEntity({
      id: appointmentWithAvailability.id,
      patientId: appointmentWithAvailability.patientId,
      professionalId: appointmentWithAvailability.professionalId,
      availabilityId: appointmentWithAvailability.availabilityId,
      appointmentDate: appointmentWithAvailability.appointmentDate,
      status: appointmentWithAvailability.status as unknown as AppointmentStatus,
      createdAt: appointmentWithAvailability.createdAt,
      updatedAt: appointmentWithAvailability.updatedAt,
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
      availabilityId: entity.availabilityId,
      appointmentDate: entity.appointmentDate,
      status: entity.status as unknown as PrismaAppointmentStatus,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
    };

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
    dto.availabilityId = entity.availabilityId;
    dto.appointmentDate = entity.appointmentDate.toISOString();
    dto.status = entity.status;
    dto.createdAt = entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString();
    dto.updatedAt = entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString();
    return dto;
  }
}
