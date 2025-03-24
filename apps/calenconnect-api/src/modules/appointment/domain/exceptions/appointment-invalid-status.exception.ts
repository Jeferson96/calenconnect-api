/**
 * Excepción lanzada cuando se intenta realizar una operación no permitida según el estado actual de la cita
 */
export class AppointmentInvalidStatusException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppointmentInvalidStatusException';
  }
}
