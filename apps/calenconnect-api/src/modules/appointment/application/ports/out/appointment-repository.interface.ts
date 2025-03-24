import { AppointmentEntity } from '../../../domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../domain/value-objects/appointment-status.enum';

/**
 * Puerto secundario (salida) para la persistencia de citas
 */
export interface AppointmentRepository {
  /**
   * Guarda una cita en el repositorio
   */
  save(appointment: AppointmentEntity): Promise<AppointmentEntity>;

  /**
   * Busca una cita por su ID
   */
  findById(id: string): Promise<AppointmentEntity | null>;

  /**
   * Busca citas por ID del paciente
   */
  findByPatientId(patientId: string): Promise<AppointmentEntity[]>;

  /**
   * Busca citas por ID del profesional
   */
  findByProfessionalId(professionalId: string): Promise<AppointmentEntity[]>;

  /**
   * Busca citas por rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<AppointmentEntity[]>;

  /**
   * Busca citas por estado
   */
  findByStatus(status: AppointmentStatus): Promise<AppointmentEntity[]>;

  /**
   * Actualiza una cita
   */
  update(id: string, data: Partial<AppointmentEntity>): Promise<AppointmentEntity>;

  /**
   * Elimina una cita
   */
  delete(id: string): Promise<void>;
}
