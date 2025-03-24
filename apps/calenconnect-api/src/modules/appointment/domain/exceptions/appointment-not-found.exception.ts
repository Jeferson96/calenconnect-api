/**
 * Excepción lanzada cuando no se encuentra una cita
 */
export class AppointmentNotFoundException extends Error {
  constructor(id: string) {
    super(`No se encontró cita con ID: ${id}`);
    this.name = 'AppointmentNotFoundException';
  }
}
