import { AppointmentStatus } from '../value-objects/appointment-status.enum';

/**
 * Entidad que representa una cita médica
 */
export class AppointmentEntity {
  readonly id?: string;
  readonly patientId: string;
  readonly professionalId: string;
  readonly appointmentDate: Date;
  readonly status: AppointmentStatus;
  readonly notes?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    id?: string;
    patientId: string;
    professionalId: string;
    appointmentDate: Date;
    status?: AppointmentStatus;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.patientId = props.patientId;
    this.professionalId = props.professionalId;
    this.appointmentDate = props.appointmentDate;
    this.status = props.status ?? AppointmentStatus.SCHEDULED;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  /**
   * Valida que la entidad cumpla con las reglas de negocio
   */
  private validate(): void {
    if (!this.patientId) {
      throw new Error('El ID del paciente es obligatorio');
    }

    if (!this.professionalId) {
      throw new Error('El ID del profesional es obligatorio');
    }

    if (!this.appointmentDate) {
      throw new Error('La fecha de la cita es obligatoria');
    }

    // Solo validar fechas en el pasado para citas nuevas (sin ID)
    // o que no estén completadas/canceladas
    if (!this.id && this.appointmentDate < new Date()) {
      throw new Error('La fecha de la cita no puede ser en el pasado');
    }
  }

  /**
   * Verifica si la cita puede ser cancelada
   */
  canBeCancelled(): boolean {
    // Una cita sólo puede ser cancelada si está programada o reprogramada
    return (
      this.status === AppointmentStatus.SCHEDULED || this.status === AppointmentStatus.RESCHEDULED
    );
  }

  /**
   * Verifica si la cita puede ser completada
   */
  canBeCompleted(): boolean {
    // Una cita sólo puede ser completada si está programada o reprogramada
    return (
      this.status === AppointmentStatus.SCHEDULED || this.status === AppointmentStatus.RESCHEDULED
    );
  }

  /**
   * Verifica si la cita puede ser reprogramada
   */
  canBeRescheduled(): boolean {
    // Una cita sólo puede ser reprogramada si está programada
    return this.status === AppointmentStatus.SCHEDULED;
  }
}
