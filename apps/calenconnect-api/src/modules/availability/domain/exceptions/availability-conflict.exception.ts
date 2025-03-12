/**
 * Excepción lanzada cuando hay un conflicto con disponibilidades existentes
 */
export class AvailabilityConflictException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvailabilityConflictException';
  }
}
