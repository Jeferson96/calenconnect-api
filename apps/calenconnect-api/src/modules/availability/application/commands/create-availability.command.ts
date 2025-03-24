/**
 * Comando para crear una nueva disponibilidad
 */
export class CreateAvailabilityCommand {
  constructor(
    public readonly professionalId: string,
    public readonly availableDate: Date,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly isBooked: boolean = false,
  ) {}
}
