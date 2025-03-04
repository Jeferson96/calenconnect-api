export interface ICreateAvailability {
  professionalId: string;
  availableDate: Date;
  startTime: Date;
  endTime: Date;
  isBooked?: boolean;
}
