import { AppointmentEntity } from '../../../domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../domain/value-objects/appointment-status.enum';
import { v4 as uuidv4 } from 'uuid';

describe('AppointmentEntity', () => {
  // Crear fechas para las pruebas
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(10, 0, 0, 0);

  const validProps = {
    id: uuidv4(),
    patientId: uuidv4(),
    professionalId: uuidv4(),
    availabilityId: uuidv4(),
    appointmentDate: tomorrow,
    status: AppointmentStatus.SCHEDULED,
    notes: 'Notas de prueba',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a valid appointment entity', () => {
    const appointment = new AppointmentEntity(validProps);

    expect(appointment).toBeDefined();
    expect(appointment.id).toBe(validProps.id);
    expect(appointment.patientId).toBe(validProps.patientId);
    expect(appointment.professionalId).toBe(validProps.professionalId);
    expect(appointment.availabilityId).toBe(validProps.availabilityId);
    expect(appointment.appointmentDate).toBe(validProps.appointmentDate);
    expect(appointment.status).toBe(validProps.status);
    expect(appointment.notes).toBe(validProps.notes);
    expect(appointment.createdAt).toBe(validProps.createdAt);
    expect(appointment.updatedAt).toBe(validProps.updatedAt);
  });

  it('should create appointment with default status', () => {
    const propsWithoutStatus = {
      patientId: validProps.patientId,
      professionalId: validProps.professionalId,
      availabilityId: validProps.availabilityId,
      appointmentDate: tomorrow,
    };

    const appointment = new AppointmentEntity(propsWithoutStatus);

    expect(appointment.status).toBe(AppointmentStatus.SCHEDULED);
  });

  it('should throw error when patientId is missing', () => {
    const invalidProps = { ...validProps, patientId: '' };

    expect(() => new AppointmentEntity(invalidProps)).toThrow('El ID del paciente es obligatorio');
  });

  it('should throw error when professionalId is missing', () => {
    const invalidProps = { ...validProps, professionalId: '' };

    expect(() => new AppointmentEntity(invalidProps)).toThrow(
      'El ID del profesional es obligatorio',
    );
  });

  it('should throw error when appointmentDate is missing', () => {
    const invalidProps = { ...validProps, appointmentDate: null as unknown as Date };

    expect(() => new AppointmentEntity(invalidProps)).toThrow('La fecha de la cita es obligatoria');
  });

  it('should throw error when creating new appointment with past date', () => {
    const pastDateProps = {
      patientId: validProps.patientId,
      professionalId: validProps.professionalId,
      availabilityId: validProps.availabilityId,
      appointmentDate: yesterday,
    };

    expect(() => new AppointmentEntity(pastDateProps)).toThrow(
      'La fecha de la cita no puede ser en el pasado',
    );
  });

  it('should not throw error for existing appointment with past date', () => {
    const pastDateProps = {
      id: uuidv4(), // Con ID, se considera existente
      patientId: validProps.patientId,
      professionalId: validProps.professionalId,
      availabilityId: validProps.availabilityId,
      appointmentDate: yesterday,
    };

    expect(() => new AppointmentEntity(pastDateProps)).not.toThrow();
  });

  describe('canBeCancelled', () => {
    it('should return true for SCHEDULED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.SCHEDULED,
      });

      expect(appointment.canBeCancelled()).toBe(true);
    });

    it('should return true for RESCHEDULED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.RESCHEDULED,
      });

      expect(appointment.canBeCancelled()).toBe(true);
    });

    it('should return false for COMPLETED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.COMPLETED,
      });

      expect(appointment.canBeCancelled()).toBe(false);
    });

    it('should return false for CANCELLED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.CANCELLED,
      });

      expect(appointment.canBeCancelled()).toBe(false);
    });

    it('should return false for NO_SHOW appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.NO_SHOW,
      });

      expect(appointment.canBeCancelled()).toBe(false);
    });
  });

  describe('canBeCompleted', () => {
    it('should return true for SCHEDULED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.SCHEDULED,
      });

      expect(appointment.canBeCompleted()).toBe(true);
    });

    it('should return true for RESCHEDULED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.RESCHEDULED,
      });

      expect(appointment.canBeCompleted()).toBe(true);
    });

    it('should return false for COMPLETED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.COMPLETED,
      });

      expect(appointment.canBeCompleted()).toBe(false);
    });

    it('should return false for CANCELLED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.CANCELLED,
      });

      expect(appointment.canBeCompleted()).toBe(false);
    });
  });

  describe('canBeRescheduled', () => {
    it('should return true for SCHEDULED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.SCHEDULED,
      });

      expect(appointment.canBeRescheduled()).toBe(true);
    });

    it('should return false for RESCHEDULED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.RESCHEDULED,
      });

      expect(appointment.canBeRescheduled()).toBe(false);
    });

    it('should return false for COMPLETED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.COMPLETED,
      });

      expect(appointment.canBeRescheduled()).toBe(false);
    });

    it('should return false for CANCELLED appointment', () => {
      const appointment = new AppointmentEntity({
        ...validProps,
        status: AppointmentStatus.CANCELLED,
      });

      expect(appointment.canBeRescheduled()).toBe(false);
    });
  });
});
