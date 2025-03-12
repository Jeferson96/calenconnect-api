import { AvailabilityEntity } from '../../../domain/entities/availability.entity';
import { CreateAvailabilityCommand } from '../../commands/create-availability.command';
import { UpdateAvailabilityCommand } from '../../commands/update-availability.command';

/**
 * Puerto primario (entrada) para los casos de uso relacionados con disponibilidad
 */
export interface AvailabilityUseCase {
  /**
   * Crea una nueva disponibilidad
   */
  createAvailability(command: CreateAvailabilityCommand): Promise<AvailabilityEntity>;

  /**
   * Actualiza una disponibilidad existente
   */
  updateAvailability(id: string, command: UpdateAvailabilityCommand): Promise<AvailabilityEntity>;

  /**
   * Busca una disponibilidad por su ID
   */
  findAvailabilityById(id: string): Promise<AvailabilityEntity | null>;

  /**
   * Busca disponibilidades por ID del profesional
   */
  findAvailabilityByProfessionalId(professionalId: string): Promise<AvailabilityEntity[]>;

  /**
   * Busca disponibilidades disponibles por ID del profesional y fecha
   */
  findAvailableSlots(professionalId: string, date: Date): Promise<AvailabilityEntity[]>;

  /**
   * Elimina una disponibilidad por su ID
   */
  deleteAvailability(id: string): Promise<AvailabilityEntity>;

  /**
   * Marca una disponibilidad como reservada
   */
  markAsBooked(professionalId: string, date: Date): Promise<void>;

  /**
   * Marca una disponibilidad como disponible
   */
  markAsAvailable(professionalId: string, date: Date): Promise<void>;
}
