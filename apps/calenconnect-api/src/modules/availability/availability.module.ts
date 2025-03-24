import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { AvailabilityController } from './infrastructure/controllers/availability.controller';
import { AvailabilityService } from './application/availability.service';
import { AvailabilityMapper } from './infrastructure/mappers/availability.mapper';
import { PrismaAvailabilityRepository } from './infrastructure/repositories/prisma-availability.repository';
import { UserModule } from '../user/user.module';

/**
 * Módulo de disponibilidad implementado siguiendo principios de arquitectura limpia y DDD
 */
@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityMapper,
    {
      provide: 'AvailabilityRepository',
      useClass: PrismaAvailabilityRepository,
    },
    {
      provide: 'AvailabilityUseCase',
      useClass: AvailabilityService,
    },
    AvailabilityService,
  ],
  exports: [
    AvailabilityService,
    {
      provide: 'AvailabilityRepository',
      useClass: PrismaAvailabilityRepository,
    },
    {
      provide: 'AvailabilityUseCase',
      useClass: AvailabilityService,
    },
  ],
})
export class AvailabilityModule {}
