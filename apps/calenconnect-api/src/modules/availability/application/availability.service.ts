import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityUseCase } from './ports/in/availability-use-case.interface';
import { AvailabilityRepository } from './ports/out/availability-repository.interface';
import { AvailabilityEntity } from '../domain/entities/availability.entity';
import { CreateAvailabilityCommand } from './commands/create-availability.command';
import { UpdateAvailabilityCommand } from './commands/update-availability.command';
import { AvailabilityNotFoundException } from '../domain/exceptions/availability-not-found.exception';
import { AvailabilityConflictException } from '../domain/exceptions/availability-conflict.exception';
import { AvailabilityValidationException } from '../domain/exceptions/availability-validation.exception';
import { UserRepository } from '../../user/application/ports/out/user-repository.interface';

/**
 * Implementación de los casos de uso de disponibilidad
 */
@Injectable()
export class AvailabilityService implements AvailabilityUseCase {
  // Constantes para reglas de negocio (podríamos extraerlas a un archivo de configuración)
  private readonly MIN_START_HOUR = 8;
  private readonly MAX_END_HOUR = 20;
  private readonly MIN_SLOT_DURATION_MINUTES = 30;
  private readonly MAX_ADVANCE_DAYS = 90;

  constructor(
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async createAvailability(command: CreateAvailabilityCommand): Promise<AvailabilityEntity> {
    // Validar que el profesional existe
    const professional = await this.userRepository.findById(command.professionalId);
    if (!professional) {
      throw new AvailabilityValidationException('Profesional no encontrado');
    }

    // Validar horarios y fechas
    this.validateTimeSlot(command.startTime, command.endTime);
    this.validateDateRange(command.availableDate);

    // Crear la entidad de disponibilidad
    const availability = new AvailabilityEntity({
      professionalId: command.professionalId,
      availableDate: command.availableDate,
      startTime: command.startTime,
      endTime: command.endTime,
      isBooked: command.isBooked,
    });

    // Verificar superposición con otras disponibilidades
    await this.checkForOverlap(availability);

    // Guardar la nueva disponibilidad
    return this.availabilityRepository.save(availability);
  }

  async updateAvailability(
    id: string,
    command: UpdateAvailabilityCommand,
  ): Promise<AvailabilityEntity> {
    // Verificar que la disponibilidad existe
    const existingAvailability = await this.findAvailabilityById(id);
    if (!existingAvailability) {
      throw new AvailabilityNotFoundException(id);
    }

    // Preparar datos para actualización
    const updateData: {
      availableDate?: Date;
      startTime?: Date;
      endTime?: Date;
      isBooked?: boolean;
    } = {};

    if (command.availableDate) {
      this.validateDateRange(command.availableDate);
      updateData.availableDate = command.availableDate;
    }

    if (command.startTime || command.endTime) {
      const startTime = command.startTime || existingAvailability.startTime;
      const endTime = command.endTime || existingAvailability.endTime;
      this.validateTimeSlot(startTime, endTime);

      if (command.startTime) updateData.startTime = command.startTime;
      if (command.endTime) updateData.endTime = command.endTime;
    }

    if (command.isBooked !== undefined) {
      updateData.isBooked = command.isBooked;
    }

    // Si hay cambios en fechas u horarios, verificar superposición
    if (updateData.availableDate || updateData.startTime || updateData.endTime) {
      // Crear una nueva entidad temporal para verificar superposición
      const tempAvailability = new AvailabilityEntity({
        id: existingAvailability.id,
        professionalId: existingAvailability.professionalId,
        availableDate: updateData.availableDate || existingAvailability.availableDate,
        startTime: updateData.startTime || existingAvailability.startTime,
        endTime: updateData.endTime || existingAvailability.endTime,
        isBooked:
          updateData.isBooked !== undefined ? updateData.isBooked : existingAvailability.isBooked,
      });

      await this.checkForOverlap(tempAvailability, id);
    }

    // Actualizar la disponibilidad
    return this.availabilityRepository.update(id, updateData);
  }

  async findAvailabilityById(id: string): Promise<AvailabilityEntity | null> {
    return this.availabilityRepository.findById(id);
  }

  async findAvailabilityByProfessionalId(professionalId: string): Promise<AvailabilityEntity[]> {
    return this.availabilityRepository.findByProfessionalId(professionalId);
  }

  async findAvailableSlots(professionalId: string, date: Date): Promise<AvailabilityEntity[]> {
    return this.availabilityRepository.findAvailableSlots(professionalId, date);
  }

  async deleteAvailability(id: string): Promise<AvailabilityEntity> {
    const availability = await this.findAvailabilityById(id);
    if (!availability) {
      throw new AvailabilityNotFoundException(id);
    }
    return this.availabilityRepository.delete(id);
  }

  async markAsBooked(professionalId: string, date: Date): Promise<void> {
    const slots = await this.availabilityRepository.findAvailableSlots(professionalId, date);
    if (slots.length === 0) {
      throw new AvailabilityNotFoundException(
        'No se encontró disponibilidad para el horario solicitado',
      );
    }

    await this.availabilityRepository.update(slots[0].id!, { isBooked: true });
  }

  async markAsAvailable(professionalId: string, date: Date): Promise<void> {
    const slots = await this.availabilityRepository.findByProfessionalId(professionalId);

    const matchingSlots = slots.filter((slot) => slot.isSameDay(date) && slot.isBooked);

    if (matchingSlots.length === 0) {
      throw new AvailabilityNotFoundException(
        'No se encontró disponibilidad reservada para liberar',
      );
    }

    await this.availabilityRepository.update(matchingSlots[0].id!, { isBooked: false });
  }

  /**
   * Métodos privados para validaciones
   */
  private validateTimeSlot(startTime: Date, endTime: Date): void {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validar que el horario está dentro del rango permitido
    const startHour = start.getHours();
    const endHour = end.getHours();

    if (startHour < this.MIN_START_HOUR) {
      throw new AvailabilityValidationException(
        `El horario no puede comenzar antes de las ${this.MIN_START_HOUR}:00`,
      );
    }

    if (endHour > this.MAX_END_HOUR) {
      throw new AvailabilityValidationException(
        `El horario no puede terminar después de las ${this.MAX_END_HOUR}:00`,
      );
    }

    // Validar duración mínima
    const duration = end.getTime() - start.getTime();
    const minDuration = this.MIN_SLOT_DURATION_MINUTES * 60 * 1000;

    if (duration < minDuration) {
      throw new AvailabilityValidationException(
        `La duración mínima debe ser de ${this.MIN_SLOT_DURATION_MINUTES} minutos`,
      );
    }

    // Validar que la hora de inicio es anterior a la hora de fin
    if (startTime >= endTime) {
      throw new AvailabilityValidationException(
        'La hora de inicio debe ser anterior a la hora de fin',
      );
    }
  }

  private validateDateRange(date: Date): void {
    const now = new Date();
    const maxDate = new Date(now.getTime() + this.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

    if (date < now) {
      throw new AvailabilityValidationException('La fecha no puede ser anterior a la fecha actual');
    }

    if (date > maxDate) {
      throw new AvailabilityValidationException(
        `No se pueden programar horarios más allá de ${this.MAX_ADVANCE_DAYS} días`,
      );
    }
  }

  private async checkForOverlap(
    availability: AvailabilityEntity,
    excludeId?: string,
  ): Promise<void> {
    const existingSlots = await this.availabilityRepository.findByProfessionalId(
      availability.professionalId,
    );

    const hasOverlap = existingSlots.some((slot) => {
      // Excluir la disponibilidad actual (en caso de actualización)
      if (excludeId && slot.id === excludeId) {
        return false;
      }

      return availability.overlaps(slot);
    });

    if (hasOverlap) {
      throw new AvailabilityConflictException('El horario se superpone con otro horario existente');
    }
  }
}
