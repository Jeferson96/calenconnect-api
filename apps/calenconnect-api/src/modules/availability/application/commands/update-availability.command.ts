/**
 * Comando para actualizar una disponibilidad existente
 */
export class UpdateAvailabilityCommand {
  constructor(
    public readonly availableDate?: Date,
    public readonly startTime?: Date,
    public readonly endTime?: Date,
    public readonly isBooked?: boolean,
  ) {}
}
