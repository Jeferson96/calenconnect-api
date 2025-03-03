import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IBaseRepository } from './base.repository.interface';
import { PrismaClient } from '@prisma/client';

@Injectable()
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: keyof PrismaClient,
  ) {}

  async create(data: Partial<T>): Promise<T> {
    return (this.prisma[this.modelName] as any).create({
      data,
    });
  }

  async findById(id: string): Promise<T | null> {
    return (this.prisma[this.modelName] as any).findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<T[]> {
    return (this.prisma[this.modelName] as any).findMany();
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return (this.prisma[this.modelName] as any).update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return (this.prisma[this.modelName] as any).delete({
      where: { id },
    });
  }
}
