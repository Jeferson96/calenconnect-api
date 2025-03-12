import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'ID del profesional',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  professionalId: string;

  @ApiProperty({
    description: 'Fecha disponible (YYYY-MM-DD)',
    example: '2023-05-15',
  })
  @IsNotEmpty()
  @IsDateString()
  availableDate: string;

  @ApiProperty({
    description: 'Hora de inicio (ISO8601)',
    example: '2023-05-15T09:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Hora de fin (ISO8601)',
    example: '2023-05-15T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Indica si el horario está reservado',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isBooked?: boolean = false;
}
