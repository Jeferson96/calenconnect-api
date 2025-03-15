import { Module } from '@nestjs/common';
import { ConfigModule } from '@libs/config';
import { CommonModule } from '@libs/common';
import { DomainModule } from '@libs/domain';
import { UserModule } from './modules/user/user.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AppointmentModule } from './modules/appointment/appointment.module';

@Module({
  imports: [
    // Módulos de infraestructura
    ConfigModule,
    CommonModule,
    DomainModule,

    // Módulos de la aplicación
    UserModule,
    AvailabilityModule,
    AppointmentModule,
  ],
})
export class AppModule {}
