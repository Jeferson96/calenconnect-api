import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { AppointmentController } from './infrastructure/controllers/appointment.controller';
import { AppointmentService } from './application/appointment.service';
import { AppointmentMapper } from './infrastructure/mappers/appointment.mapper';
import { PrismaAppointmentRepository } from './infrastructure/repositories/prisma-appointment.repository';
import { UserModule } from '../user/user.module';
import { AvailabilityModule } from '../availability/availability.module';

/**
 * Módulo de citas implementado siguiendo principios de arquitectura limpia y DDD
 */
@Module({
  imports: [DatabaseModule, UserModule, AvailabilityModule],
  controllers: [AppointmentController],
  providers: [
    AppointmentMapper,
    {
      provide: 'AppointmentRepository',
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: 'AppointmentUseCase',
      useClass: AppointmentService,
    },
  ],
  exports: ['AppointmentUseCase', 'AppointmentRepository', AppointmentMapper],
})
export class AppointmentModule {}
