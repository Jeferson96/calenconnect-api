import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'notification');
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
