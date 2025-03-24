import { AvailabilityEntity } from '../../../domain/entities/availability.entity';
import { v4 as uuidv4 } from 'uuid';

describe('AvailabilityEntity', () => {
  // Asegurarnos de crear fechas sin zona horaria para las pruebas
  const createDateWithoutTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const validProps = {
    id: uuidv4(),
    professionalId: uuidv4(),
    availableDate: createDateWithoutTime('2023-12-01'),
    startTime: new Date('2023-12-01T09:00:00'),
    endTime: new Date('2023-12-01T10:00:00'),
    isBooked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a valid availability entity', () => {
    const availability = new AvailabilityEntity(validProps);

    expect(availability).toBeDefined();
    expect(availability.id).toBe(validProps.id);
    expect(availability.professionalId).toBe(validProps.professionalId);
    expect(availability.availableDate).toBe(validProps.availableDate);
    expect(availability.startTime).toBe(validProps.startTime);
    expect(availability.endTime).toBe(validProps.endTime);
    expect(availability.isBooked).toBe(validProps.isBooked);
    expect(availability.createdAt).toBe(validProps.createdAt);
    expect(availability.updatedAt).toBe(validProps.updatedAt);
  });

  it('should create availability with default isBooked value', () => {
    // Usar una copia sin incluir isBooked en lugar de eliminarlo
    const propsWithoutIsBooked = {
      id: validProps.id,
      professionalId: validProps.professionalId,
      availableDate: validProps.availableDate,
      startTime: validProps.startTime,
      endTime: validProps.endTime,
      createdAt: validProps.createdAt,
      updatedAt: validProps.updatedAt,
    };

    const availability = new AvailabilityEntity(propsWithoutIsBooked);

    expect(availability.isBooked).toBe(false);
  });

  it('should throw error when professionalId is missing', () => {
    const invalidProps = { ...validProps, professionalId: '' };

    expect(() => new AvailabilityEntity(invalidProps)).toThrow(
      'El ID del profesional es obligatorio',
    );
  });

  it('should throw error when availableDate is missing', () => {
    const invalidProps = { ...validProps, availableDate: null as unknown as Date };

    expect(() => new AvailabilityEntity(invalidProps)).toThrow(
      'La fecha disponible es obligatoria',
    );
  });

  it('should throw error when startTime is missing', () => {
    const invalidProps = { ...validProps, startTime: null as unknown as Date };

    expect(() => new AvailabilityEntity(invalidProps)).toThrow('La hora de inicio es obligatoria');
  });

  it('should throw error when endTime is missing', () => {
    const invalidProps = { ...validProps, endTime: null as unknown as Date };

    expect(() => new AvailabilityEntity(invalidProps)).toThrow('La hora de fin es obligatoria');
  });

  it('should throw error when startTime is later than or equal to endTime', () => {
    const invalidProps = {
      ...validProps,
      startTime: new Date('2023-12-01T11:00:00'),
      endTime: new Date('2023-12-01T10:00:00'),
    };

    expect(() => new AvailabilityEntity(invalidProps)).toThrow(
      'La hora de inicio debe ser anterior a la hora de fin',
    );

    const equalTimeProps = {
      ...validProps,
      startTime: new Date('2023-12-01T10:00:00'),
      endTime: new Date('2023-12-01T10:00:00'),
    };

    expect(() => new AvailabilityEntity(equalTimeProps)).toThrow(
      'La hora de inicio debe ser anterior a la hora de fin',
    );
  });

  describe('isSameDay', () => {
    it('should return true when dates are on the same day', () => {
      const availability = new AvailabilityEntity(validProps);
      // Asegurarnos de crear una fecha en el mismo formato que availableDate
      const sameDay = createDateWithoutTime('2023-12-01');

      expect(availability.isSameDay(sameDay)).toBe(true);
    });

    it('should return false when dates are on different days', () => {
      const availability = new AvailabilityEntity(validProps);
      const differentDay = createDateWithoutTime('2023-12-02');

      expect(availability.isSameDay(differentDay)).toBe(false);
    });
  });

  describe('overlaps', () => {
    const availability = new AvailabilityEntity({
      professionalId: uuidv4(),
      availableDate: new Date('2023-12-01'),
      startTime: new Date('2023-12-01T09:00:00'),
      endTime: new Date('2023-12-01T11:00:00'),
    });

    it('should return false when availabilities are on different days', () => {
      const other = new AvailabilityEntity({
        professionalId: uuidv4(),
        availableDate: new Date('2023-12-02'),
        startTime: new Date('2023-12-02T09:30:00'),
        endTime: new Date('2023-12-02T10:30:00'),
      });

      expect(availability.overlaps(other)).toBe(false);
    });

    it('should return true when other availability starts during this one', () => {
      const other = new AvailabilityEntity({
        professionalId: uuidv4(),
        availableDate: new Date('2023-12-01'),
        startTime: new Date('2023-12-01T10:00:00'),
        endTime: new Date('2023-12-01T12:00:00'),
      });

      expect(availability.overlaps(other)).toBe(true);
    });

    it('should return true when other availability ends during this one', () => {
      const other = new AvailabilityEntity({
        professionalId: uuidv4(),
        availableDate: new Date('2023-12-01'),
        startTime: new Date('2023-12-01T08:00:00'),
        endTime: new Date('2023-12-01T10:00:00'),
      });

      expect(availability.overlaps(other)).toBe(true);
    });

    it('should return true when other availability is completely within this one', () => {
      const other = new AvailabilityEntity({
        professionalId: uuidv4(),
        availableDate: new Date('2023-12-01'),
        startTime: new Date('2023-12-01T09:30:00'),
        endTime: new Date('2023-12-01T10:30:00'),
      });

      expect(availability.overlaps(other)).toBe(true);
    });

    it('should return true when this availability is completely within the other one', () => {
      const other = new AvailabilityEntity({
        professionalId: uuidv4(),
        availableDate: new Date('2023-12-01'),
        startTime: new Date('2023-12-01T08:00:00'),
        endTime: new Date('2023-12-01T12:00:00'),
      });

      expect(availability.overlaps(other)).toBe(true);
    });

    it('should return false when availabilities do not overlap', () => {
      const other = new AvailabilityEntity({
        professionalId: uuidv4(),
        availableDate: new Date('2023-12-01'),
        startTime: new Date('2023-12-01T11:00:00'),
        endTime: new Date('2023-12-01T12:00:00'),
      });

      expect(availability.overlaps(other)).toBe(false);
    });
  });
});
