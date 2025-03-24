import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@libs/config';
import { PrismaService } from './prisma.service';
import { SupabaseService } from './supabase.service';
import { UserRepository } from './repositories/user.repository';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AvailabilityRepository } from './repositories/availability.repository';
import { NotificationRepository } from './repositories/notification.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PrismaService,
      useFactory: () => PrismaService.getInstance(),
    },
    {
      provide: SupabaseService,
      useFactory: (configService: ConfigService) => {
        return new SupabaseService(configService);
      },
      inject: [ConfigService],
    },
    UserRepository,
    AppointmentRepository,
    AvailabilityRepository,
    NotificationRepository,
  ],
  exports: [
    PrismaService,
    SupabaseService,
    UserRepository,
    AppointmentRepository,
    AvailabilityRepository,
    NotificationRepository,
  ],
})
export class DatabaseModule {}
