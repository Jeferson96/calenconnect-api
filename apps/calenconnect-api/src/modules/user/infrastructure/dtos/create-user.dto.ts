import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../../domain/value-objects/user-role.enum';

/**
 * DTO para la creación de usuarios
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'ID del usuario en el sistema de autenticación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  authUserId: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.PATIENT,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
