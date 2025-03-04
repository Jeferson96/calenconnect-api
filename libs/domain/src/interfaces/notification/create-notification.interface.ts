import { NotificationType } from '@prisma/client';

export interface ICreateNotification {
  userId: string;
  appointmentId: string;
  type: NotificationType;
  isSent?: boolean;
  sentAt?: Date;
}
