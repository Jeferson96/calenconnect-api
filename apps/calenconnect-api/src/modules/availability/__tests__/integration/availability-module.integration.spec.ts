import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from '../../application/availability.service';
import { AvailabilityModule } from '../../availability.module';
import { DatabaseModule } from '@libs/database';
import { PrismaService } from '@libs/database';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateAvailabilityCommand } from '../../application/commands/create-availability.command';
import { cleanDatabaseSafely } from '../../../../../test/utils/test-helpers';
import { TestDataFactory } from '../../../../../test/utils/test-data-factory';
import { UpdateAvailabilityCommand } from '../../application/commands/update-availability.command';

describe('AvailabilityModule Integration Tests', () => {
  let moduleRef: TestingModule;
  let availabilityService: AvailabilityService;
  let prismaService: PrismaService;
  let testDataFactory: TestDataFactory;

  // Variables para almacenar IDs de prueba
  let professionalId: string;
  let testAvailabilityId: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AvailabilityModule, DatabaseModule],
    }).compile();

    availabilityService = moduleRef.get<AvailabilityService>(AvailabilityService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    testDataFactory = new TestDataFactory(prismaService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Limpiar la base de datos respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);

    // Crear un profesional de prueba con la fábrica de datos
    const professional = await testDataFactory.createTestProfessional('Doctor', 'Disponibilidad');
    professionalId = professional.id;
    console.log(`Profesional creado con ID: ${professionalId}`);
  }, 20000);

  describe('createAvailability', () => {
    it('should create a new availability entity and save it to database', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const startTime = new Date(tomorrow);
      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const command = new CreateAvailabilityCommand(
        professionalId,
        tomorrow,
        startTime,
        endTime,
        false,
      );

      // Act
      const savedAvailability = await availabilityService.createAvailability(command);
      testAvailabilityId = savedAvailability.id as string;

      // Assert
      expect(savedAvailability).toBeDefined();
      expect(savedAvailability).toBeInstanceOf(AvailabilityEntity);
      expect(savedAvailability.professionalId).toBe(professionalId);
      expect(savedAvailability.isBooked).toBe(false);
      expect(savedAvailability.availableDate.getDate()).toBe(tomorrow.getDate());

      // Verificar persistencia en base de datos
      const dbAvailability = await prismaService.availability.findUnique({
        where: { id: testAvailabilityId },
      });
      expect(dbAvailability).toBeDefined();
      if (dbAvailability) {
        expect(dbAvailability.professionalId).toBe(professionalId);
        expect(dbAvailability.isBooked).toBe(false);
      }
    }, 20000);
  });

  describe('findAvailabilityById', () => {
    it('should retrieve an existing availability from database', async () => {
      // Arrange - Crear una disponibilidad para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const startTime = new Date(tomorrow);
      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const command = new CreateAvailabilityCommand(
        professionalId,
        tomorrow,
        startTime,
        endTime,
        false,
      );

      // Creamos la disponibilidad usando el servicio
      const createdAvailability = await availabilityService.createAvailability(command);
      expect(createdAvailability).toBeDefined();
      const availabilityId = createdAvailability.id as string; // Aseguramos que no sea undefined

      // Act - Ahora buscamos la disponibilidad por su ID
      const availability = await availabilityService.findAvailabilityById(availabilityId);

      // Assert
      expect(availability).toBeDefined();
      expect(availability).not.toBeNull();

      if (availability) {
        expect(availability).toBeInstanceOf(AvailabilityEntity);
        expect(availability.id).toBe(availabilityId);
        expect(availability.professionalId).toBe(professionalId);
        expect(availability.isBooked).toBe(false);
      }
    }, 20000);

    it('should return null for non-existent availability', async () => {
      // Arrange
      const nonExistentId = uuidv4();

      // Act
      const availability = await availabilityService.findAvailabilityById(nonExistentId);

      // Assert
      expect(availability).toBeNull();
    }, 20000);
  });

  describe('findAvailableSlots', () => {
    it('should find available slots for a specific date', async () => {
      // Arrange - Crear disponibilidades para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Primera disponibilidad: 10-11 AM
      const startTime1 = new Date(tomorrow);
      const endTime1 = new Date(tomorrow);
      endTime1.setHours(11, 0, 0, 0);

      // Segunda disponibilidad: 2-3 PM
      const startTime2 = new Date(tomorrow);
      startTime2.setHours(14, 0, 0, 0);
      const endTime2 = new Date(tomorrow);
      endTime2.setHours(15, 0, 0, 0);

      await availabilityService.createAvailability(
        new CreateAvailabilityCommand(professionalId, tomorrow, startTime1, endTime1, false),
      );

      await availabilityService.createAvailability(
        new CreateAvailabilityCommand(professionalId, tomorrow, startTime2, endTime2, false),
      );

      // Act
      const availableSlots = await availabilityService.findAvailableSlots(professionalId, tomorrow);

      // Assert
      expect(availableSlots).toBeDefined();
      expect(availableSlots.length).toBe(2);
      expect(availableSlots[0].isBooked).toBe(false);
      expect(availableSlots[1].isBooked).toBe(false);

      // Verificar los horarios
      const slotTimes = availableSlots.map((slot) => slot.startTime.getHours()).sort();
      expect(slotTimes).toEqual([10, 14]);
    }, 20000);
  });

  describe('updateAvailability', () => {
    it('should update an existing availability', async () => {
      // Arrange - Crear una disponibilidad para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const startTime = new Date(tomorrow);
      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const command = new CreateAvailabilityCommand(
        professionalId,
        tomorrow,
        startTime,
        endTime,
        false,
      );

      const createdAvailability = await availabilityService.createAvailability(command);
      expect(createdAvailability).toBeDefined();
      const availabilityId = createdAvailability.id as string; // Aseguramos que no sea undefined

      // Act - Actualizar a "reservado"
      const updateCommand = {
        isBooked: true,
      } as UpdateAvailabilityCommand;

      const updatedAvailability = await availabilityService.updateAvailability(
        availabilityId,
        updateCommand,
      );

      // Assert
      expect(updatedAvailability).toBeDefined();
      expect(updatedAvailability.id).toBe(availabilityId);
      expect(updatedAvailability.isBooked).toBe(true);

      // Verificar persistencia en base de datos
      const dbAvailability = await prismaService.availability.findUnique({
        where: { id: availabilityId },
      });
      expect(dbAvailability).toBeDefined();
      if (dbAvailability) {
        expect(dbAvailability.isBooked).toBe(true);
      }
    }, 20000);
  });

  describe('deleteAvailability', () => {
    it('should delete an existing availability', async () => {
      // Arrange - Crear una disponibilidad para la prueba
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const startTime = new Date(tomorrow);
      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const command = new CreateAvailabilityCommand(
        professionalId,
        tomorrow,
        startTime,
        endTime,
        false,
      );

      const createdAvailability = await availabilityService.createAvailability(command);
      expect(createdAvailability).toBeDefined();
      const availabilityId = createdAvailability.id as string; // Aseguramos que no sea undefined

      // Act
      const deletedAvailability = await availabilityService.deleteAvailability(availabilityId);

      // Assert
      expect(deletedAvailability).toBeDefined();
      expect(deletedAvailability.id).toBe(availabilityId);

      // Verificar que ya no existe en la base de datos
      const dbAvailability = await prismaService.availability.findUnique({
        where: { id: availabilityId },
      });
      expect(dbAvailability).toBeNull();
    }, 20000);
  });
});
