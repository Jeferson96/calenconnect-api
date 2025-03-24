import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@libs/database';
import { PrismaAppointmentRepository } from '../../../infrastructure/repositories/prisma-appointment.repository';
import { AppointmentMapper } from '../../../infrastructure/mappers/appointment.mapper';
import { AppointmentEntity } from '../../../domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../domain/value-objects/appointment-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { cleanDatabaseSafely } from '../../../../../../test/utils/test-helpers';
import { TestDataFactory } from '../../../../../../test/utils/test-data-factory';

describe('PrismaAppointmentRepository Integration Tests', () => {
  let repository: PrismaAppointmentRepository;
  let prismaService: PrismaService;
  let testDataFactory: TestDataFactory;
  let testData: {
    patient: any;
    professional: any;
    availability: any;
    appointment: any;
  };

  // Variables para almacenar los IDs necesarios para las pruebas
  let patientId: string;
  let professionalId: string;
  let availabilityId: string;
  let testAppointmentId: string;

  // Crear fechas para mañana - definidas a nivel de suite
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, AppointmentMapper, PrismaAppointmentRepository],
    }).compile();

    repository = module.get<PrismaAppointmentRepository>(PrismaAppointmentRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    testDataFactory = new TestDataFactory(prismaService);

    // Limpiar las tablas relacionadas antes de las pruebas respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);
    console.log('Base de datos limpiada correctamente antes de las pruebas');

    // Crear datos de prueba con nuestra fábrica
    testData = await testDataFactory.setupAppointmentTestData();

    // Guardar los IDs para usar en las pruebas
    patientId = testData.patient.id;
    professionalId = testData.professional.id;
    availabilityId = testData.availability.id;
    testAppointmentId = testData.appointment.id;

    console.log('Datos de prueba creados correctamente:');
    console.log(`- Patient ID: ${patientId}`);
    console.log(`- Professional ID: ${professionalId}`);
    console.log(`- Availability ID: ${availabilityId}`);
    console.log(`- Appointment ID: ${testAppointmentId}`);
  }, 30000); // Aumentar el timeout a 30000 ms

  afterAll(async () => {
    // Limpiar las tablas relacionadas después de las pruebas respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);
    console.log('Base de datos limpiada correctamente después de las pruebas');
    await prismaService.$disconnect();
  }, 30000); // Aumentar el timeout a 30000 ms

  // Función auxiliar para crear una entidad de cita para pruebas
  const createAppointmentEntity = () => {
    return new AppointmentEntity({
      patientId,
      professionalId,
      availabilityId,
      appointmentDate: tomorrow,
      status: AppointmentStatus.SCHEDULED,
    });
  };

  describe('save', () => {
    it('should create and return a new appointment entity', async () => {
      // Arrange
      const newAppointment = createAppointmentEntity();

      // Act
      const savedAppointment = await repository.save(newAppointment);

      // Guardar el ID para pruebas posteriores
      if (savedAppointment.id) {
        // Solo actualizar si hay un ID (debe haberlo)
        testAppointmentId = savedAppointment.id.toString();
      }

      // Assert
      expect(savedAppointment).toBeDefined();
      expect(savedAppointment.id).toBeDefined();
      expect(savedAppointment.patientId).toBe(patientId);
      expect(savedAppointment.professionalId).toBe(professionalId);
      expect(savedAppointment.availabilityId).toBe(availabilityId);
      expect(savedAppointment.status).toBe(AppointmentStatus.SCHEDULED);
    });
  });

  describe('findById', () => {
    it('should find an appointment by ID', async () => {
      // Act
      const foundAppointment = await repository.findById(testAppointmentId);

      // Assert
      expect(foundAppointment).toBeDefined();
      expect(foundAppointment?.id).toBe(testAppointmentId);
      expect(foundAppointment?.patientId).toBe(patientId);
      expect(foundAppointment?.professionalId).toBe(professionalId);
    });

    it('should return null for non-existent ID', async () => {
      // Act
      const nonExistentId = uuidv4();
      const result = await repository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByPatientId', () => {
    it('should find appointments by patient ID', async () => {
      // Act
      const appointments = await repository.findByPatientId(patientId);

      // Assert
      expect(appointments).toBeDefined();
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments[0].patientId).toBe(patientId);
    });

    it('should return empty array for non-existent patient ID', async () => {
      // Act
      const nonExistentId = uuidv4();
      const appointments = await repository.findByPatientId(nonExistentId);

      // Assert
      expect(appointments).toBeDefined();
      expect(appointments.length).toBe(0);
    });
  });

  describe('findByProfessionalId', () => {
    it('should find appointments by professional ID', async () => {
      // Act
      const appointments = await repository.findByProfessionalId(professionalId);

      // Assert
      expect(appointments).toBeDefined();
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments[0].professionalId).toBe(professionalId);
    });
  });

  describe('findByDateRange', () => {
    it('should find appointments in a date range', async () => {
      // Arrange
      const startDate = new Date(tomorrow);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tomorrow);
      endDate.setHours(23, 59, 59, 999);

      // Act
      const appointments = await repository.findByDateRange(startDate, endDate);

      // Assert
      expect(appointments).toBeDefined();
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments[0].appointmentDate.getDate()).toBe(tomorrow.getDate());
    });
  });

  describe('findByStatus', () => {
    it('should find appointments by status', async () => {
      // Act
      const appointments = await repository.findByStatus(AppointmentStatus.SCHEDULED);

      // Assert
      expect(appointments).toBeDefined();
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments[0].status).toBe(AppointmentStatus.SCHEDULED);
    });
  });

  describe('update', () => {
    it('should update an appointment', async () => {
      // Arrange
      const updateData = {
        status: AppointmentStatus.COMPLETED,
      };

      // Act
      const updatedAppointment = await repository.update(testAppointmentId, updateData);

      // Assert
      expect(updatedAppointment).toBeDefined();
      expect(updatedAppointment.id).toBe(testAppointmentId);
      expect(updatedAppointment.status).toBe(AppointmentStatus.COMPLETED);
    });
  });

  describe('delete', () => {
    it('should delete an appointment', async () => {
      // Act
      await repository.delete(testAppointmentId);
      const afterDelete = await repository.findById(testAppointmentId);

      // Assert
      expect(afterDelete).toBeNull();
    });
  });
});
