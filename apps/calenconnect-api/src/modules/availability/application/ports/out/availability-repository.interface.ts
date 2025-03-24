import { AvailabilityEntity } from '../../../domain/entities/availability.entity';

/**
 * Puerto secundario (salida) para la persistencia de disponibilidades
 */
export interface AvailabilityRepository {
  /**
   * Guarda una disponibilidad en el repositorio
   */
  save(availability: AvailabilityEntity): Promise<AvailabilityEntity>;

  /**
   * Busca una disponibilidad por su ID
   */
  findById(id: string): Promise<AvailabilityEntity | null>;

  /**
   * Busca disponibilidades por ID del profesional
   */
  findByProfessionalId(professionalId: string): Promise<AvailabilityEntity[]>;

  /**
   * Busca disponibilidades en un rango de fechas
   */
  findByDateRange(
    professionalId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilityEntity[]>;

  /**
   * Busca disponibilidades disponibles por ID del profesional y fecha
   */
  findAvailableSlots(professionalId: string, date: Date): Promise<AvailabilityEntity[]>;

  /**
   * Actualiza una disponibilidad existente
   */
  update(id: string, data: Partial<AvailabilityEntity>): Promise<AvailabilityEntity>;

  /**
   * Elimina una disponibilidad
   */
  delete(id: string): Promise<AvailabilityEntity>;
}
