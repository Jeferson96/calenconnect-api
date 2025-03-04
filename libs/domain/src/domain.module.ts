import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { UserService } from './services/user.service';
import { AppointmentService } from './services/appointment.service';
import { AvailabilityService } from './services/availability.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, AppointmentService, AvailabilityService, NotificationService],
  exports: [UserService, AppointmentService, AvailabilityService, NotificationService],
})
export class DomainModule {}
