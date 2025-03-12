import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'ID del profesional',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty()
  @IsUUID()
  professionalId: string;

  @ApiProperty({
    description: 'Fecha y hora de la cita (ISO8601)',
    example: '2023-05-15T09:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({
    description: 'Estado de la cita',
    enum: AppointmentStatus,
    example: 'SCHEDULED',
    default: 'SCHEDULED',
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus = AppointmentStatus.SCHEDULED;
}
