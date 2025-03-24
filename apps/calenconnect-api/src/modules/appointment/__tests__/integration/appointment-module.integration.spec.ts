import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from '../../application/appointment.service';
import { AppointmentModule } from '../../appointment.module';
import { DatabaseModule } from '@libs/database';
import { PrismaService } from '@libs/database';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateAppointmentCommand } from '../../application/commands/create-appointment.command';
import { cleanDatabaseSafely } from '../../../../../test/utils/test-helpers';
import { TestDataFactory } from '../../../../../test/utils/test-data-factory';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';

describe('AppointmentModule Integration Tests', () => {
  let moduleRef: TestingModule;
  let appointmentService: AppointmentService;
  let prismaService: PrismaService;
  let testDataFactory: TestDataFactory;

  // Variables para almacenar IDs de prueba
  let patientId: string;
  let professionalId: string;
  let availabilityId: string;
  let testAppointmentId: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppointmentModule, DatabaseModule],
    }).compile();

    // Obtenemos el servicio que está exportado como 'AppointmentUseCase'
    appointmentService = moduleRef.get('AppointmentUseCase');
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    testDataFactory = new TestDataFactory(prismaService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Limpiar la base de datos respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);

    // Crear datos de prueba
    const patient = await testDataFactory.createTestPatient('Paciente', 'Prueba');
    patientId = patient.id;
    console.log(`Paciente creado con ID: ${patientId}`);

    const professional = await testDataFactory.createTestProfessional('Doctor', 'Prueba');
    professionalId = professional.id;
    console.log(`Profesional creado con ID: ${professionalId}`);

    // Crear disponibilidad para la prueba (solo necesita professionalId y opcional isBooked)
    const availability = await testDataFactory.createTestAvailability(professionalId, false);
    availabilityId = availability.id;
    console.log(`Disponibilidad creada con ID: ${availabilityId}`);
  }, 30000);

  describe('createAppointment', () => {
    it('should create a new appointment entity and save it to database', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const command = new CreateAppointmentCommand({
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: tomorrow,
        status: AppointmentStatus.SCHEDULED,
      });

      // Act
      const savedAppointment = await appointmentService.createAppointment(command);
      testAppointmentId = savedAppointment.id as string;

      // Assert
      expect(savedAppointment).toBeDefined();
      expect(savedAppointment).toBeInstanceOf(AppointmentEntity);
      expect(savedAppointment.patientId).toBe(patientId);
      expect(savedAppointment.professionalId).toBe(professionalId);
      expect(savedAppointment.availabilityId).toBe(availabilityId);
      expect(savedAppointment.status).toBe(AppointmentStatus.SCHEDULED);

      // Verificar persistencia en base de datos
      const dbAppointment = await prismaService.appointment.findUnique({
        where: { id: testAppointmentId },
      });
      expect(dbAppointment).toBeDefined();
      if (dbAppointment) {
        expect(dbAppointment.patientId).toBe(patientId);
        expect(dbAppointment.professionalId).toBe(professionalId);
        expect(dbAppointment.status).toBe(AppointmentStatus.SCHEDULED);
      }

      // Verificar que la disponibilidad está marcada como reservada
      const dbAvailability = await prismaService.availability.findUnique({
        where: { id: availabilityId },
      });
      expect(dbAvailability).toBeDefined();
      expect(dbAvailability?.isBooked).toBe(true);
    }, 30000);
  });

  describe('findAppointmentById', () => {
    it('should retrieve an existing appointment from database', async () => {
      // Arrange - Crear una cita para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const command = new CreateAppointmentCommand({
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: tomorrow,
        status: AppointmentStatus.SCHEDULED,
      });

      // Creamos la cita usando el servicio
      const createdAppointment = await appointmentService.createAppointment(command);
      expect(createdAppointment).toBeDefined();
      const appointmentId = createdAppointment.id as string;

      // Act - Ahora buscamos la cita por su ID
      const appointment = await appointmentService.findAppointmentById(appointmentId);

      // Assert
      expect(appointment).toBeDefined();
      expect(appointment).not.toBeNull();

      if (appointment) {
        expect(appointment).toBeInstanceOf(AppointmentEntity);
        expect(appointment.id).toBe(appointmentId);
        expect(appointment.patientId).toBe(patientId);
        expect(appointment.professionalId).toBe(professionalId);
        expect(appointment.status).toBe(AppointmentStatus.SCHEDULED);
      }
    }, 30000);

    it('should return null for non-existent appointment', async () => {
      // Arrange
      const nonExistentId = uuidv4();

      // Act
      const appointment = await appointmentService.findAppointmentById(nonExistentId);

      // Assert
      expect(appointment).toBeNull();
    }, 30000);
  });

  describe('findAppointmentsByPatientId', () => {
    it('should find appointments for a specific patient', async () => {
      // Arrange - Crear una cita para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const command = new CreateAppointmentCommand({
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: tomorrow,
      });

      await appointmentService.createAppointment(command);

      // Act
      const patientAppointments = await appointmentService.findAppointmentsByPatientId(patientId);

      // Assert
      expect(patientAppointments).toBeDefined();
      expect(patientAppointments.length).toBeGreaterThan(0);
      expect(patientAppointments[0].patientId).toBe(patientId);
      expect(patientAppointments[0].professionalId).toBe(professionalId);
    }, 30000);
  });

  describe('cancelAppointment', () => {
    it('should cancel an existing appointment', async () => {
      // Arrange - Crear una cita para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const command = new CreateAppointmentCommand({
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: tomorrow,
      });

      const createdAppointment = await appointmentService.createAppointment(command);
      expect(createdAppointment).toBeDefined();
      const appointmentId = createdAppointment.id as string;

      // Act - Cancelar la cita
      const cancelledAppointment = await appointmentService.cancelAppointment(appointmentId);

      // Assert
      expect(cancelledAppointment).toBeDefined();
      expect(cancelledAppointment.id).toBe(appointmentId);
      expect(cancelledAppointment.status).toBe(AppointmentStatus.CANCELLED);

      // Verificar que la disponibilidad está liberada
      const dbAvailability = await prismaService.availability.findUnique({
        where: { id: availabilityId },
      });
      expect(dbAvailability).toBeDefined();
      expect(dbAvailability?.isBooked).toBe(false);
    }, 30000);
  });

  describe('completeAppointment', () => {
    it('should mark an appointment as completed', async () => {
      // Arrange - Crear una cita para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const command = new CreateAppointmentCommand({
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: tomorrow,
      });

      const createdAppointment = await appointmentService.createAppointment(command);
      expect(createdAppointment).toBeDefined();
      const appointmentId = createdAppointment.id as string;

      // Act - Marcar la cita como completada
      const completedAppointment = await appointmentService.completeAppointment(appointmentId);

      // Assert
      expect(completedAppointment).toBeDefined();
      expect(completedAppointment.id).toBe(appointmentId);
      expect(completedAppointment.status).toBe(AppointmentStatus.COMPLETED);
    }, 30000);
  });
});
