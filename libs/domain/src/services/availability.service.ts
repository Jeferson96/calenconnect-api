import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AvailabilityRepository } from '@libs/database';
import { UserService } from './user.service';
import { Availability } from '@prisma/client';
import { AVAILABILITY_RULES } from '../constants/business-rules';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly userService: UserService,
  ) {}

  async create(data: {
    professionalId: string;
    availableDate: Date;
    startTime: Date;
    endTime: Date;
    isBooked?: boolean;
  }): Promise<Availability> {
    // Validar que el profesional existe
    const professional = await this.userService.findById(data.professionalId);
    if (!professional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    // Validar horarios
    this.validateTimeSlot(data.startTime, data.endTime);
    this.validateDateRange(data.availableDate);

    // Verificar superposición
    await this.checkOverlap(data);

    return this.availabilityRepository.create(data);
  }

  async findById(id: string): Promise<Availability | null> {
    return this.availabilityRepository.findById(id);
  }

  async update(
    id: string,
    data: {
      availableDate?: Date;
      startTime?: Date;
      endTime?: Date;
      isBooked?: boolean;
    },
  ): Promise<Availability> {
    const availability = await this.findById(id);
    if (!availability) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }

    if (data.startTime || data.endTime) {
      this.validateTimeSlot(
        data.startTime || availability.startTime,
        data.endTime || availability.endTime,
      );
    }

    if (data.availableDate) {
      this.validateDateRange(data.availableDate);
    }

    return this.availabilityRepository.update(id, data);
  }

  async findByProfessionalId(professionalId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByProfessionalId(professionalId);
  }

  async findAvailableSlots(professionalId: string, date: Date): Promise<Availability[]> {
    return this.availabilityRepository.findAvailableSlots(professionalId, date);
  }

  async deleteById(id: string): Promise<Availability> {
    const availability = await this.findById(id);
    if (!availability) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }
    return this.availabilityRepository.delete(id);
  }

  async checkAvailability(
    professionalId: string,
    appointmentDate: string | Date,
  ): Promise<boolean> {
    const date = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
    const slots = await this.availabilityRepository.findAvailableSlots(professionalId, date);
    return slots.length > 0;
  }

  async markAsBooked(professionalId: string, appointmentDate: string | Date): Promise<void> {
    const date = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate;
    const slots = await this.availabilityRepository.findAvailableSlots(professionalId, date);

    if (slots.length === 0) {
      throw new NotFoundException('No se encontró disponibilidad para el horario solicitado');
    }

    await this.availabilityRepository.update(slots[0].id, { isBooked: true });
  }

  async markAsAvailable(professionalId: string, appointmentDate: string): Promise<void> {
    const date = new Date(appointmentDate);
    const slots = await this.availabilityRepository.findByProfessionalId(professionalId);

    const matchingSlots = slots.filter(
      (slot) =>
        new Date(slot.availableDate).toDateString() === date.toDateString() && slot.isBooked,
    );

    if (matchingSlots.length === 0) {
      throw new NotFoundException('No se encontró disponibilidad reservada para liberar');
    }

    await this.availabilityRepository.update(matchingSlots[0].id, { isBooked: false });
  }

  private validateTimeSlot(startTime: Date, endTime: Date): void {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validar que el horario está dentro del rango permitido
    const startHour = start.getHours();
    const endHour = end.getHours();

    if (startHour < AVAILABILITY_RULES.MIN_START_HOUR) {
      throw new BadRequestException(
        `El horario no puede comenzar antes de las ${AVAILABILITY_RULES.MIN_START_HOUR}:00`,
      );
    }

    if (endHour > AVAILABILITY_RULES.MAX_END_HOUR) {
      throw new BadRequestException(
        `El horario no puede terminar después de las ${AVAILABILITY_RULES.MAX_END_HOUR}:00`,
      );
    }

    // Validar duración mínima
    const duration = end.getTime() - start.getTime();
    const minDuration = AVAILABILITY_RULES.MIN_SLOT_DURATION_MINUTES * 60 * 1000;

    if (duration < minDuration) {
      throw new BadRequestException(
        `La duración mínima debe ser de ${AVAILABILITY_RULES.MIN_SLOT_DURATION_MINUTES} minutos`,
      );
    }
  }

  private validateDateRange(date: Date): void {
    const now = new Date();
    const maxDate = new Date(
      now.getTime() + AVAILABILITY_RULES.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000,
    );

    if (date < now) {
      throw new BadRequestException('La fecha no puede ser anterior a la fecha actual');
    }

    if (date > maxDate) {
      throw new BadRequestException(
        `No se pueden programar horarios más allá de ${AVAILABILITY_RULES.MAX_ADVANCE_DAYS} días`,
      );
    }
  }

  private async checkOverlap(data: {
    professionalId: string;
    availableDate: Date;
    startTime: Date;
    endTime: Date;
  }): Promise<void> {
    const existingSlots = await this.availabilityRepository.findByProfessionalId(
      data.professionalId,
    );

    const hasOverlap = existingSlots.some((slot) => {
      const slotDate = new Date(slot.availableDate).toDateString();
      const newDate = new Date(data.availableDate).toDateString();

      if (slotDate !== newDate) return false;

      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      const newStart = new Date(data.startTime);
      const newEnd = new Date(data.endTime);

      return (
        (newStart >= slotStart && newStart < slotEnd) ||
        (newEnd > slotStart && newEnd <= slotEnd) ||
        (newStart <= slotStart && newEnd >= slotEnd)
      );
    });

    if (hasOverlap) {
      throw new BadRequestException('El horario se superpone con otro horario existente');
    }
  }
}
