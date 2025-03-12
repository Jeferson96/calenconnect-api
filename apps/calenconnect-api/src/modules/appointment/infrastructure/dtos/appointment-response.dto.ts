import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';

/**
 * DTO para la respuesta de citas a la API
 */
export class AppointmentResponseDto {
  @ApiProperty({
    description: 'ID de la cita',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  patientId: string;

  @ApiProperty({
    description: 'ID del profesional',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  professionalId: string;

  @ApiProperty({
    description: 'Fecha y hora de la cita',
    example: '2023-05-15T09:00:00Z',
  })
  appointmentDate: string;

  @ApiProperty({
    description: 'Estado de la cita',
    enum: AppointmentStatus,
    example: 'SCHEDULED',
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Traer resultados de análisis previos',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2023-05-10T14:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2023-05-10T14:30:00Z',
  })
  updatedAt: string;
}
