/**
 * Excepción lanzada cuando hay un error de validación en los datos de una cita
 */
export class AppointmentValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppointmentValidationException';
  }
}
