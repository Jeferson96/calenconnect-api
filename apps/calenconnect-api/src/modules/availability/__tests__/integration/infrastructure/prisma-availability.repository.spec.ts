import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@libs/database';
import { PrismaAvailabilityRepository } from '../../../infrastructure/repositories/prisma-availability.repository';
import { AvailabilityMapper } from '../../../infrastructure/mappers/availability.mapper';
import { AvailabilityEntity } from '../../../domain/entities/availability.entity';
import { v4 as uuidv4 } from 'uuid';

describe('PrismaAvailabilityRepository Integration Tests', () => {
  let repository: PrismaAvailabilityRepository;
  let prismaService: PrismaService;

  // Datos de prueba
  const professionalId = uuidv4();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const createAvailabilityEntity = () => {
    return new AvailabilityEntity({
      professionalId,
      availableDate: tomorrow,
      startTime: new Date(tomorrow.getTime() + 9 * 3600000), // 9:00 AM
      endTime: new Date(tomorrow.getTime() + 10 * 3600000), // 10:00 AM
      isBooked: false,
    });
  };

  let testAvailabilityId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, AvailabilityMapper, PrismaAvailabilityRepository],
    }).compile();

    repository = module.get<PrismaAvailabilityRepository>(PrismaAvailabilityRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    // Limpiar datos existentes respetando las restricciones de clave foránea
    await prismaService.appointment.deleteMany({});
    await prismaService.notification.deleteMany({});
    await prismaService.availability.deleteMany({});
    await prismaService.user.deleteMany({});

    // Crear un profesional de prueba en la base de datos
    await prismaService.user.upsert({
      where: { id: professionalId },
      update: {},
      create: {
        id: professionalId,
        authUserId: uuidv4(),
        firstName: 'Doctor',
        lastName: 'Prueba',
        role: 'PROFESSIONAL',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    // Limpiar datos creados respetando las restricciones de clave foránea
    await prismaService.appointment.deleteMany({});
    await prismaService.notification.deleteMany({});
    await prismaService.availability.deleteMany({});
    await prismaService.user.deleteMany();
    await prismaService.$disconnect();
  });

  describe('save', () => {
    it('should create and return a new availability entity', async () => {
      // Arrange
      const newAvailability = createAvailabilityEntity();

      // Act
      const savedAvailability = await repository.save(newAvailability);
      testAvailabilityId = savedAvailability.id as string;

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
      const endDate = new Date(tomorrow);
      endDate.setDate(endDate.getDate() + 1);

      // Act
      const availabilities = await repository.findByDateRange(professionalId, startDate, endDate);

      // Assert
      expect(availabilities).toBeDefined();
      expect(availabilities.length).toBeGreaterThan(0);
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
