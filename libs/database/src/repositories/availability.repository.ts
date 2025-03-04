import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { Availability } from '@prisma/client';

@Injectable()
export class AvailabilityRepository extends BaseRepository<Availability> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'availability');
  }

  async findByProfessionalId(professionalId: string): Promise<Availability[]> {
    return this.prisma.availability.findMany({
      where: { professionalId },
      orderBy: {
        availableDate: 'asc',
      },
    });
  }

  async findByDateRange(
    professionalId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Availability[]> {
    return this.prisma.availability.findMany({
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
  }

  async findAvailableSlots(professionalId: string, date: Date): Promise<Availability[]> {
    return this.prisma.availability.findMany({
      where: {
        professionalId,
        availableDate: date,
        isBooked: false,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
}
