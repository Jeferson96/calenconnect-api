import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';

/**
 * Comando para crear una nueva cita
 */
export class CreateAppointmentCommand {
  constructor(
    public readonly patientId: string,
    public readonly professionalId: string,
    public readonly appointmentDate: Date,
    public readonly status: AppointmentStatus = AppointmentStatus.SCHEDULED,
    public readonly notes?: string,
  ) {}
}
