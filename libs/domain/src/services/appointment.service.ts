import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AppointmentRepository } from '@libs/database';
import { UserService } from './user.service';
import { Appointment, AppointmentStatus } from '@prisma/client';
import { APPOINTMENT_RULES } from '../constants/business-rules';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly userService: UserService,
  ) {}

  async create(data: {
    patientId: string;
    professionalId: string;
    appointmentDate: Date;
    status: AppointmentStatus;
  }): Promise<Appointment> {
    // Validar que el paciente existe
    const patient = await this.userService.findById(data.patientId);
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Validar que el profesional existe
    const professional = await this.userService.findById(data.professionalId);
    if (!professional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    // Validar fecha de cita
    this.validateAppointmentDate(data.appointmentDate);

    return this.appointmentRepository.create(data);
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointmentRepository.findById(id);
  }

  async updateStatus(id: string, status: AppointmentStatus, userId: string): Promise<Appointment> {
    const appointment = await this.findById(id);
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Validar que el usuario tiene permiso para actualizar
    this.validateUpdatePermission(appointment, userId);

    return this.appointmentRepository.update(id, { status });
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByPatientId(patientId);
  }

  async findByProfessionalId(professionalId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByProfessionalId(professionalId);
  }

  private validateAppointmentDate(date: Date): void {
    const now = new Date();
    const minDate = new Date(now.getTime() + APPOINTMENT_RULES.MIN_ADVANCE_HOURS * 60 * 60 * 1000);
    const maxDate = new Date(
      now.getTime() + APPOINTMENT_RULES.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000,
    );

    if (date < minDate) {
      throw new BadRequestException(
        `La cita debe programarse con al menos ${APPOINTMENT_RULES.MIN_ADVANCE_HOURS} horas de anticipación`,
      );
    }

    if (date > maxDate) {
      throw new BadRequestException(
        `La cita no puede programarse más allá de ${APPOINTMENT_RULES.MAX_ADVANCE_DAYS} días`,
      );
    }
  }

  private validateUpdatePermission(appointment: Appointment, userId: string): void {
    const isPatient = appointment.patientId === userId;
    const isProfessional = appointment.professionalId === userId;

    if (!isPatient && !isProfessional) {
      throw new BadRequestException('No tiene permiso para actualizar esta cita');
    }
  }
}
