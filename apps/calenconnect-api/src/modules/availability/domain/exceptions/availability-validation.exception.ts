/**
 * Excepción lanzada cuando hay un error de validación en los datos de disponibilidad
 */
export class AvailabilityValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvailabilityValidationException';
  }
}
