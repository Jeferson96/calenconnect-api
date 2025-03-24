import { Injectable } from '@nestjs/common';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { Availability } from '@prisma/client';
import { AvailabilityResponseDto } from '../dtos/availability-response.dto';

/**
 * Mapeador para convertir entre diferentes representaciones de la disponibilidad
 */
@Injectable()
export class AvailabilityMapper {
  /**
   * Convierte un modelo de Prisma a una entidad de dominio
   */
  toEntity(prismaAvailability: Availability): AvailabilityEntity {
    return new AvailabilityEntity({
      id: prismaAvailability.id,
      professionalId: prismaAvailability.professionalId,
      availableDate: prismaAvailability.availableDate,
      startTime: prismaAvailability.startTime,
      endTime: prismaAvailability.endTime,
      isBooked: prismaAvailability.isBooked,
      createdAt: prismaAvailability.createdAt,
      updatedAt: prismaAvailability.updatedAt,
    });
  }

  /**
   * Convierte una entidad de dominio a un modelo de Prisma
   */
  toPrisma(entity: AvailabilityEntity): Omit<Availability, 'id'> & { id?: string } {
    return {
      id: entity.id,
      professionalId: entity.professionalId,
      availableDate: entity.availableDate,
      startTime: entity.startTime,
      endTime: entity.endTime,
      isBooked: entity.isBooked,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Convierte una entidad de dominio a un DTO de respuesta
   */
  toResponseDto(entity: AvailabilityEntity): AvailabilityResponseDto {
    const dto = new AvailabilityResponseDto();
    dto.id = entity.id!;
    dto.professionalId = entity.professionalId;
    dto.availableDate = entity.availableDate.toISOString().split('T')[0];
    dto.startTime = entity.startTime.toISOString();
    dto.endTime = entity.endTime.toISOString();
    dto.isBooked = entity.isBooked;
    dto.createdAt = entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString();
    dto.updatedAt = entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString();
    return dto;
  }
}
