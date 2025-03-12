import { Inject, Injectable } from '@nestjs/common';
import { AppointmentUseCase } from './ports/in/appointment-use-case.interface';
import { AppointmentRepository } from './ports/out/appointment-repository.interface';
import { AppointmentEntity } from '../domain/entities/appointment.entity';
import { AppointmentStatus } from '../domain/value-objects/appointment-status.enum';
import { CreateAppointmentCommand } from './commands/create-appointment.command';
import { UpdateAppointmentCommand } from './commands/update-appointment.command';
import { AppointmentNotFoundException } from '../domain/exceptions/appointment-not-found.exception';
import { AppointmentValidationException } from '../domain/exceptions/appointment-validation.exception';
import { AppointmentInvalidStatusException } from '../domain/exceptions/appointment-invalid-status.exception';
import { UserRepository } from '../../user/application/ports/out/user-repository.interface';

/**
 * Interfaz para el caso de uso de disponibilidad
 */
interface AvailabilityUseCase {
  findAvailableSlots(professionalId: string, date: Date): Promise<Array<any>>;
  markAsBooked(professionalId: string, date: Date): Promise<void>;
  markAsAvailable(professionalId: string, date: Date): Promise<void>;
}

/**
 * Implementación de los casos de uso de citas
 */
@Injectable()
export class AppointmentService implements AppointmentUseCase {
  // Constantes para reglas de negocio
  private readonly MIN_ADVANCE_HOURS = 2;
  private readonly MAX_ADVANCE_DAYS = 60;

  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('AvailabilityUseCase')
    private readonly availabilityUseCase: AvailabilityUseCase,
  ) {}

  async createAppointment(command: CreateAppointmentCommand): Promise<AppointmentEntity> {
    // Validar que el paciente existe
    const patient = await this.userRepository.findById(command.patientId);
    if (!patient) {
      throw new AppointmentValidationException('Paciente no encontrado');
    }

    // Validar que el profesional existe
    const professional = await this.userRepository.findById(command.professionalId);
    if (!professional) {
      throw new AppointmentValidationException('Profesional no encontrado');
    }

    // Validar fecha de la cita
    this.validateAppointmentDate(command.appointmentDate);

    // Verificar disponibilidad
    const availableSlots = await this.availabilityUseCase.findAvailableSlots(
      command.professionalId,
      command.appointmentDate,
    );

    if (availableSlots.length === 0) {
      throw new AppointmentValidationException(
        'No hay disponibilidad para la fecha y hora seleccionada',
      );
    }

    // Crear la entidad de cita
    const appointment = new AppointmentEntity({
      patientId: command.patientId,
      professionalId: command.professionalId,
      appointmentDate: command.appointmentDate,
      status: command.status,
      notes: command.notes,
    });

    // Marcar la disponibilidad como reservada
    await this.availabilityUseCase.markAsBooked(command.professionalId, command.appointmentDate);

    // Guardar la cita
    return this.appointmentRepository.save(appointment);
  }

  async updateAppointment(
    id: string,
    command: UpdateAppointmentCommand,
  ): Promise<AppointmentEntity> {
    // Verificar que la cita existe
    const existingAppointment = await this.findAppointmentById(id);
    if (!existingAppointment) {
      throw new AppointmentNotFoundException(id);
    }

    // Preparar datos para actualización
    const updateData: {
      appointmentDate?: Date;
      status?: AppointmentStatus;
      notes?: string;
    } = {};

    // Si se cambia la fecha, validarla
    if (command.appointmentDate) {
      this.validateAppointmentDate(command.appointmentDate);
      updateData.appointmentDate = command.appointmentDate;
    }

    if (command.status !== undefined) {
      updateData.status = command.status;
    }

    if (command.notes !== undefined) {
      updateData.notes = command.notes;
    }

    // Actualizar la cita
    return this.appointmentRepository.update(id, updateData);
  }

  async findAppointmentById(id: string): Promise<AppointmentEntity | null> {
    return this.appointmentRepository.findById(id);
  }

  async findAppointmentsByPatientId(patientId: string): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.findByPatientId(patientId);
  }

  async findAppointmentsByProfessionalId(professionalId: string): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.findByProfessionalId(professionalId);
  }

  async findAppointmentsByStatus(status: AppointmentStatus): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.findByStatus(status);
  }

  async completeAppointment(id: string): Promise<AppointmentEntity> {
    const appointment = await this.findAppointmentById(id);
    if (!appointment) {
      throw new AppointmentNotFoundException(id);
    }

    if (!appointment.canBeCompleted()) {
      throw new AppointmentInvalidStatusException(
        'La cita no puede ser completada debido a su estado actual',
      );
    }

    return this.appointmentRepository.update(id, { status: AppointmentStatus.COMPLETED });
  }

  async cancelAppointment(id: string): Promise<AppointmentEntity> {
    const appointment = await this.findAppointmentById(id);
    if (!appointment) {
      throw new AppointmentNotFoundException(id);
    }

    if (!appointment.canBeCancelled()) {
      throw new AppointmentInvalidStatusException(
        'La cita no puede ser cancelada debido a su estado actual',
      );
    }

    // Liberar la disponibilidad
    await this.availabilityUseCase.markAsAvailable(
      appointment.professionalId,
      appointment.appointmentDate,
    );

    return this.appointmentRepository.update(id, { status: AppointmentStatus.CANCELLED });
  }

  async rescheduleAppointment(id: string, newDate: Date): Promise<AppointmentEntity> {
    const appointment = await this.findAppointmentById(id);
    if (!appointment) {
      throw new AppointmentNotFoundException(id);
    }

    if (!appointment.canBeRescheduled()) {
      throw new AppointmentInvalidStatusException(
        'La cita no puede ser reprogramada debido a su estado actual',
      );
    }

    // Validar la nueva fecha
    this.validateAppointmentDate(newDate);

    // Verificar disponibilidad en la nueva fecha
    const availableSlots = await this.availabilityUseCase.findAvailableSlots(
      appointment.professionalId,
      newDate,
    );

    if (availableSlots.length === 0) {
      throw new AppointmentValidationException('No hay disponibilidad para la nueva fecha y hora');
    }

    // Liberar la disponibilidad anterior
    await this.availabilityUseCase.markAsAvailable(
      appointment.professionalId,
      appointment.appointmentDate,
    );

    // Reservar la nueva disponibilidad
    await this.availabilityUseCase.markAsBooked(appointment.professionalId, newDate);

    return this.appointmentRepository.update(id, {
      appointmentDate: newDate,
      status: AppointmentStatus.RESCHEDULED,
    });
  }

  async markAsNoShow(id: string): Promise<AppointmentEntity> {
    const appointment = await this.findAppointmentById(id);
    if (!appointment) {
      throw new AppointmentNotFoundException(id);
    }

    if (
      appointment.status !== AppointmentStatus.SCHEDULED &&
      appointment.status !== AppointmentStatus.RESCHEDULED
    ) {
      throw new AppointmentInvalidStatusException(
        'Solo las citas programadas o reprogramadas pueden marcarse como no presentadas',
      );
    }

    return this.appointmentRepository.update(id, { status: AppointmentStatus.NO_SHOW });
  }

  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.findAppointmentById(id);
    if (!appointment) {
      throw new AppointmentNotFoundException(id);
    }

    // Si la cita está programada o reprogramada, liberar la disponibilidad
    if (
      appointment.status === AppointmentStatus.SCHEDULED ||
      appointment.status === AppointmentStatus.RESCHEDULED
    ) {
      await this.availabilityUseCase.markAsAvailable(
        appointment.professionalId,
        appointment.appointmentDate,
      );
    }

    await this.appointmentRepository.delete(id);
  }

  /**
   * Métodos privados para validaciones
   */
  private validateAppointmentDate(date: Date): void {
    const now = new Date();
    const minDate = new Date(now.getTime() + this.MIN_ADVANCE_HOURS * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() + this.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

    if (date < minDate) {
      throw new AppointmentValidationException(
        `Las citas deben programarse con al menos ${this.MIN_ADVANCE_HOURS} horas de antelación`,
      );
    }

    if (date > maxDate) {
      throw new AppointmentValidationException(
        `Las citas no pueden programarse con más de ${this.MAX_ADVANCE_DAYS} días de antelación`,
      );
    }
  }
}
