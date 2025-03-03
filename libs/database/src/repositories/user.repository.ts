import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'user');
  }

  async findByAuthId(authId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { authUserId: authId },
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role },
    });
  }
}
