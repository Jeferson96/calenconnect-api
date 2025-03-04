import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '@libs/database';
import { UserService } from './user.service';
import { AppointmentService } from './appointment.service';
import { Notification, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userService: UserService,
    private readonly appointmentService: AppointmentService,
  ) {}

  async create(data: {
    userId: string;
    appointmentId: string;
    type: NotificationType;
  }): Promise<Notification> {
    // Validar que el usuario existe
    const user = await this.userService.findById(data.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar que la cita existe
    const appointment = await this.appointmentService.findById(data.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Crear la notificación
    const notification = await this.notificationRepository.create({
      ...data,
      isSent: false,
    });

    // Enviar la notificación
    await this.sendNotification(notification);

    return notification;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  private async sendNotification(notification: Notification): Promise<void> {
    // TODO: Implementar el envío de correo electrónico
    // Por ahora solo marcamos como enviada
    await this.notificationRepository.update(notification.id, {
      isSent: true,
      sentAt: new Date(),
    });
  }

  async sendAppointmentReminder(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentService.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Crear notificación para el paciente
    await this.create({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      type: NotificationType.REMINDER,
    });

    // Crear notificación para el profesional
    await this.create({
      userId: appointment.professionalId,
      appointmentId: appointment.id,
      type: NotificationType.REMINDER,
    });
  }

  async sendCancellationNotification(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentService.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Crear notificación para el paciente
    await this.create({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      type: NotificationType.CANCELLATION,
    });

    // Crear notificación para el profesional
    await this.create({
      userId: appointment.professionalId,
      appointmentId: appointment.id,
      type: NotificationType.CANCELLATION,
    });
  }

  async sendConfirmationNotification(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentService.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Crear notificación para el paciente
    await this.create({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      type: NotificationType.CONFIRMATION,
    });

    // Crear notificación para el profesional
    await this.create({
      userId: appointment.professionalId,
      appointmentId: appointment.id,
      type: NotificationType.CONFIRMATION,
    });
  }
}
