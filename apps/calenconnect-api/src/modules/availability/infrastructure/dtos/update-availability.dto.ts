import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: 'Fecha disponible (YYYY-MM-DD)',
    example: '2023-05-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  availableDate?: string;

  @ApiProperty({
    description: 'Hora de inicio (ISO8601)',
    example: '2023-05-15T09:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    description: 'Hora de fin (ISO8601)',
    example: '2023-05-15T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({
    description: 'Indica si el horario está reservado',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isBooked?: boolean;
}
