import { AppointmentEntity } from '../../../domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../domain/value-objects/appointment-status.enum';
import { CreateAppointmentCommand } from '../../commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../../commands/update-appointment.command';

/**
 * Puerto primario (entrada) para los casos de uso relacionados con citas
 */
export interface AppointmentUseCase {
  /**
   * Crea una nueva cita
   */
  createAppointment(command: CreateAppointmentCommand): Promise<AppointmentEntity>;

  /**
   * Actualiza una cita existente
   */
  updateAppointment(id: string, command: UpdateAppointmentCommand): Promise<AppointmentEntity>;

  /**
   * Busca una cita por su ID
   */
  findAppointmentById(id: string): Promise<AppointmentEntity | null>;

  /**
   * Busca citas por ID del paciente
   */
  findAppointmentsByPatientId(patientId: string): Promise<AppointmentEntity[]>;

  /**
   * Busca citas por ID del profesional
   */
  findAppointmentsByProfessionalId(professionalId: string): Promise<AppointmentEntity[]>;

  /**
   * Busca citas por su estado
   */
  findAppointmentsByStatus(status: AppointmentStatus): Promise<AppointmentEntity[]>;

  /**
   * Cambia el estado de una cita a completada
   */
  completeAppointment(id: string): Promise<AppointmentEntity>;

  /**
   * Cambia el estado de una cita a cancelada
   */
  cancelAppointment(id: string): Promise<AppointmentEntity>;

  /**
   * Cambia el estado de una cita a reprogramada
   */
  rescheduleAppointment(id: string, newDate: Date): Promise<AppointmentEntity>;

  /**
   * Cambia el estado de una cita a no presentado
   */
  markAsNoShow(id: string): Promise<AppointmentEntity>;

  /**
   * Elimina una cita
   */
  deleteAppointment(id: string): Promise<void>;
}
