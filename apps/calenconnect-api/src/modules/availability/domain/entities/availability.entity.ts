/**
 * Entidad que representa una disponibilidad de un profesional
 */
export class AvailabilityEntity {
  readonly id?: string;
  readonly professionalId: string;
  readonly availableDate: Date;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly isBooked: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    id?: string;
    professionalId: string;
    availableDate: Date;
    startTime: Date;
    endTime: Date;
    isBooked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.professionalId = props.professionalId;
    this.availableDate = props.availableDate;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.isBooked = props.isBooked ?? false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  /**
   * Valida que la entidad cumpla con las reglas de negocio
   */
  private validate(): void {
    if (!this.professionalId) {
      throw new Error('El ID del profesional es obligatorio');
    }

    if (!this.availableDate) {
      throw new Error('La fecha disponible es obligatoria');
    }

    if (!this.startTime) {
      throw new Error('La hora de inicio es obligatoria');
    }

    if (!this.endTime) {
      throw new Error('La hora de fin es obligatoria');
    }

    if (this.startTime >= this.endTime) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin');
    }
  }

  /**
   * Determina si la disponibilidad está en el mismo día que la fecha proporcionada
   */
  isSameDay(date: Date): boolean {
    return (
      this.availableDate.getFullYear() === date.getFullYear() &&
      this.availableDate.getMonth() === date.getMonth() &&
      this.availableDate.getDate() === date.getDate()
    );
  }

  /**
   * Determina si hay superposición con otra disponibilidad
   */
  overlaps(other: AvailabilityEntity): boolean {
    if (!this.isSameDay(other.availableDate)) {
      return false;
    }

    return (
      (this.startTime <= other.startTime && this.endTime > other.startTime) ||
      (this.startTime < other.endTime && this.endTime >= other.endTime) ||
      (this.startTime >= other.startTime && this.endTime <= other.endTime)
    );
  }
}
