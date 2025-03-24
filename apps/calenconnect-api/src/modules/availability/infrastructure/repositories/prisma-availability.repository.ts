import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { AvailabilityRepository } from '../../application/ports/out/availability-repository.interface';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { AvailabilityMapper } from '../mappers/availability.mapper';

/**
 * Implementación del repositorio de disponibilidad utilizando Prisma
 */
@Injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AvailabilityMapper,
  ) {}

  /**
   * Guarda una disponibilidad en la base de datos
   */
  async save(availability: AvailabilityEntity): Promise<AvailabilityEntity> {
    const prismaAvailability = this.mapper.toPrisma(availability);
    const saved = await this.prisma.availability.create({
      data: prismaAvailability,
    });
    return this.mapper.toEntity(saved);
  }

  /**
   * Busca una disponibilidad por su ID
   */
  async findById(id: string): Promise<AvailabilityEntity | null> {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });

    return availability ? this.mapper.toEntity(availability) : null;
  }

  /**
   * Busca disponibilidades por ID del profesional
   */
  async findByProfessionalId(professionalId: string): Promise<AvailabilityEntity[]> {
    const availabilities = await this.prisma.availability.findMany({
      where: { professionalId },
      orderBy: {
        availableDate: 'asc',
      },
    });

    return availabilities.map((availability) => this.mapper.toEntity(availability));
  }

  /**
   * Busca disponibilidades en un rango de fechas
   */
  async findByDateRange(
    professionalId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilityEntity[]> {
    const availabilities = await this.prisma.availability.findMany({
      where: {
        professionalId,
        availableDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        availableDate: 'asc',
      },
    });

    return availabilities.map((availability) => this.mapper.toEntity(availability));
  }

  /**
   * Busca disponibilidades disponibles por ID del profesional y fecha
   */
  async findAvailableSlots(professionalId: string, date: Date): Promise<AvailabilityEntity[]> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);

    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const availabilities = await this.prisma.availability.findMany({
      where: {
        professionalId,
        availableDate: {
          gte: dateStart,
          lte: dateEnd,
        },
        isBooked: false,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return availabilities.map((availability) => this.mapper.toEntity(availability));
  }

  /**
   * Actualiza una disponibilidad existente
   */
  async update(id: string, data: Partial<AvailabilityEntity>): Promise<AvailabilityEntity> {
    // Convertir la entidad parcial a un objeto Prisma
    const updateData: {
      availableDate?: Date;
      startTime?: Date;
      endTime?: Date;
      isBooked?: boolean;
    } = {};

    // Solo incluimos los campos que existen en el modelo Prisma
    if (data.availableDate !== undefined) updateData.availableDate = data.availableDate;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.isBooked !== undefined) updateData.isBooked = data.isBooked;

    const updated = await this.prisma.availability.update({
      where: { id },
      data: updateData,
    });

    return this.mapper.toEntity(updated);
  }

  /**
   * Elimina una disponibilidad
   */
  async delete(id: string): Promise<AvailabilityEntity> {
    const deleted = await this.prisma.availability.delete({
      where: { id },
    });

    return this.mapper.toEntity(deleted);
  }
}
