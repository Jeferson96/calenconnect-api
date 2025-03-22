import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';

/**
 * Comando para crear una nueva cita
 */
export class CreateAppointmentCommand {
  readonly patientId: string;
  readonly professionalId: string;
  readonly availabilityId: string;
  readonly appointmentDate: Date;
  readonly status: AppointmentStatus;
  readonly notes?: string;

  constructor(props: {
    patientId: string;
    professionalId: string;
    availabilityId: string;
    appointmentDate: Date | string;
    status?: AppointmentStatus;
    notes?: string;
  }) {
    this.patientId = props.patientId;
    this.professionalId = props.professionalId;
    this.availabilityId = props.availabilityId;
    this.appointmentDate =
      typeof props.appointmentDate === 'string'
        ? new Date(props.appointmentDate)
        : props.appointmentDate;
    this.status = props.status ?? AppointmentStatus.SCHEDULED;
    this.notes = props.notes;
  }
}
