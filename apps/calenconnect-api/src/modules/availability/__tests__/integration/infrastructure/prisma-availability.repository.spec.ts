import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@libs/database';
import { PrismaAvailabilityRepository } from '../../../infrastructure/repositories/prisma-availability.repository';
import { AvailabilityMapper } from '../../../infrastructure/mappers/availability.mapper';
import { AvailabilityEntity } from '../../../domain/entities/availability.entity';
import { v4 as uuidv4 } from 'uuid';
import { cleanDatabaseSafely } from '../../../../../../test/utils/test-helpers';
import { TestDataFactory } from '../../../../../../test/utils/test-data-factory';

describe('PrismaAvailabilityRepository Integration Tests', () => {
  let repository: PrismaAvailabilityRepository;
  let prismaService: PrismaService;
  let testDataFactory: TestDataFactory;

  // Variables para almacenar IDs de prueba
  let professionalId: string;
  let testAvailabilityId: string;

  // Crear fechas para mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, AvailabilityMapper, PrismaAvailabilityRepository],
    }).compile();

    repository = module.get<PrismaAvailabilityRepository>(PrismaAvailabilityRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    testDataFactory = new TestDataFactory(prismaService);

    // Limpiar datos existentes respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);
    console.log('Base de datos limpiada correctamente antes de las pruebas');

    // Crear un profesional de prueba con la fábrica de datos
    const professional = await testDataFactory.createTestProfessional('Doctor', 'Prueba');
    professionalId = professional.id;
    console.log(`Profesional creado con ID: ${professionalId}`);
  }, 30000);

  afterAll(async () => {
    // Limpiar datos creados respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);
    console.log('Base de datos limpiada correctamente después de las pruebas');
    await prismaService.$disconnect();
  }, 30000);

  // Función auxiliar para crear una entidad de disponibilidad para pruebas
  const createAvailabilityEntity = () => {
    return new AvailabilityEntity({
      professionalId,
      availableDate: tomorrow,
      startTime: new Date(tomorrow.getTime()),
      endTime: new Date(tomorrow.getTime() + 3600000), // 1 hora después
      isBooked: false,
    });
  };

  describe('save', () => {
    it('should create and return a new availability entity', async () => {
      // Arrange
      const newAvailability = createAvailabilityEntity();

      // Act
      const savedAvailability = await repository.save(newAvailability);
      testAvailabilityId = savedAvailability.id as string;
      console.log(`Disponibilidad creada con ID: ${testAvailabilityId}`);

      // Assert
      expect(savedAvailability).toBeDefined();
      expect(savedAvailability.id).toBeDefined();
      expect(savedAvailability.professionalId).toBe(professionalId);
      expect(savedAvailability.isBooked).toBe(false);
      expect(savedAvailability.availableDate.getDate()).toBe(tomorrow.getDate());
    });
  });

  describe('findById', () => {
    it('should find an availability by ID', async () => {
      // Verificar que tenemos un ID de disponibilidad válido
      expect(testAvailabilityId).toBeDefined();

      // Act
      const foundAvailability = await repository.findById(testAvailabilityId);

      // Assert
      expect(foundAvailability).toBeDefined();
      expect(foundAvailability?.id).toBe(testAvailabilityId);
      expect(foundAvailability?.professionalId).toBe(professionalId);
    });

    it('should return null for non-existent ID', async () => {
      // Act
      const nonExistentId = uuidv4();
      const result = await repository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByProfessionalId', () => {
    it('should find availabilities by professional ID', async () => {
      // Act
      const availabilities = await repository.findByProfessionalId(professionalId);

      // Assert
      expect(availabilities).toBeDefined();
      expect(availabilities.length).toBeGreaterThan(0);
      expect(availabilities[0].professionalId).toBe(professionalId);
    });

    it('should return empty array for non-existent professional ID', async () => {
      // Act
      const nonExistentId = uuidv4();
      const availabilities = await repository.findByProfessionalId(nonExistentId);

      // Assert
      expect(availabilities).toBeDefined();
      expect(availabilities.length).toBe(0);
    });
  });

  describe('findByDateRange', () => {
    it('should find availabilities in a date range', async () => {
      // Arrange
      const startDate = new Date(tomorrow);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tomorrow);
      endDate.setHours(23, 59, 59, 999);

      // Act
      const availabilities = await repository.findByDateRange(professionalId, startDate, endDate);

      // Assert
      expect(availabilities).toBeDefined();
      expect(availabilities.length).toBeGreaterThan(0);
      expect(availabilities[0].availableDate.getDate()).toBe(tomorrow.getDate());
    });
  });

  describe('findAvailableSlots', () => {
    it('should find available slots on a specified date', async () => {
      // Act
      const availableSlots = await repository.findAvailableSlots(professionalId, tomorrow);

      // Assert
      expect(availableSlots).toBeDefined();
      expect(availableSlots.length).toBeGreaterThan(0);
      expect(availableSlots[0].isBooked).toBe(false);
    });
  });

  describe('update', () => {
    it('should update an availability', async () => {
      // Arrange
      const updateData = {
        isBooked: true,
      };

      // Act
      const updatedAvailability = await repository.update(testAvailabilityId, updateData);

      // Assert
      expect(updatedAvailability).toBeDefined();
      expect(updatedAvailability.id).toBe(testAvailabilityId);
      expect(updatedAvailability.isBooked).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete an availability', async () => {
      // Act
      const deletedAvailability = await repository.delete(testAvailabilityId);
      const afterDelete = await repository.findById(testAvailabilityId);

      // Assert
      expect(deletedAvailability).toBeDefined();
      expect(deletedAvailability.id).toBe(testAvailabilityId);
      expect(afterDelete).toBeNull();
    });
  });
});
