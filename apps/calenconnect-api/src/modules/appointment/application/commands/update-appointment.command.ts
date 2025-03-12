import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';

/**
 * Comando para actualizar una cita existente
 */
export class UpdateAppointmentCommand {
  constructor(
    public readonly appointmentDate?: Date,
    public readonly status?: AppointmentStatus,
    public readonly notes?: string,
  ) {}
}
