import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../application/ports/out/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { PrismaService } from '@libs/database';
import { UserMapper } from '../mappers/user.mapper';
import { UserRole as PrismaUserRole } from '@prisma/client';

/**
 * Implementación del repositorio de usuarios utilizando Prisma
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserMapper,
  ) {}

  /**
   * Guarda un usuario en la base de datos
   */
  async save(user: UserEntity): Promise<UserEntity> {
    const prismaUser = this.mapper.toPrisma(user);
    const saved = await this.prisma.user.create({
      data: prismaUser,
    });
    return this.mapper.toEntity(saved);
  }

  /**
   * Busca un usuario por su ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapper.toEntity(user) : null;
  }

  /**
   * Busca un usuario por su ID de autenticación
   */
  async findByAuthId(authId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { authUserId: authId },
    });

    return user ? this.mapper.toEntity(user) : null;
  }

  /**
   * Busca usuarios por su rol
   */
  async findByRole(role: UserRole): Promise<UserEntity[]> {
    // Convertimos el enum de nuestro dominio al enum de Prisma
    const prismaRole = role as unknown as PrismaUserRole;

    const users = await this.prisma.user.findMany({
      where: { role: prismaRole },
    });

    return users.map((user) => this.mapper.toEntity(user));
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    // Crear un objeto para Prisma con solo los campos permitidos
    const updateData: {
      firstName?: string;
      lastName?: string;
      role?: PrismaUserRole;
    } = {};

    // Solo incluimos los campos que existen en User de Prisma
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.role !== undefined) {
      updateData.role = data.role as unknown as PrismaUserRole;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.mapper.toEntity(updated);
  }

  /**
   * Encuentra todos los usuarios
   */
  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.mapper.toEntity(user));
  }
}
