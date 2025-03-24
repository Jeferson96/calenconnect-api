/**
 * Excepción lanzada cuando no se encuentra una disponibilidad
 */
export class AvailabilityNotFoundException extends Error {
  constructor(id: string) {
    super(`No se encontró disponibilidad con ID: ${id}`);
    this.name = 'AvailabilityNotFoundException';
  }
}
