import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la respuesta de disponibilidad a la API
 */
export class AvailabilityResponseDto {
  @ApiProperty({
    description: 'ID de la disponibilidad',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del profesional',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  professionalId: string;

  @ApiProperty({
    description: 'Fecha disponible',
    example: '2023-05-15',
  })
  availableDate: string;

  @ApiProperty({
    description: 'Hora de inicio',
    example: '2023-05-15T09:00:00Z',
  })
  startTime: string;

  @ApiProperty({
    description: 'Hora de fin',
    example: '2023-05-15T10:00:00Z',
  })
  endTime: string;

  @ApiProperty({
    description: 'Indica si el horario está reservado',
    example: false,
  })
  isBooked: boolean;

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
