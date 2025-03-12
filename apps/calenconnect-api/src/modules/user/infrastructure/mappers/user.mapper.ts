import { Injectable } from '@nestjs/common';
import { User, UserRole as PrismaUserRole } from '@prisma/client';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserRole } from '../../domain/value-objects/user-role.enum';

/**
 * Mapper para transformar entre entidades de dominio, modelos de persistencia y DTOs
 */
@Injectable()
export class UserMapper {
  /**
   * Convierte un modelo de Prisma a una entidad de dominio
   */
  toEntity(prismaUser: User): UserEntity {
    return new UserEntity({
      id: prismaUser.id,
      authUserId: prismaUser.authUserId,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      role: prismaUser.role as unknown as UserRole,
    });
  }

  /**
   * Convierte una entidad de dominio a un modelo para Prisma
   * Omite el ID para permitir la creación de nuevos registros
   */
  toPrisma(entity: UserEntity): Omit<User, 'id'> {
    return {
      authUserId: entity.authUserId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      role: entity.role as unknown as PrismaUserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Convierte una entidad de dominio a un DTO de respuesta
   */
  toResponseDto(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.authUserId = entity.authUserId;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.role = entity.role;
    dto.fullName = entity.fullName;
    return dto;
  }
}
