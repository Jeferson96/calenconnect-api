import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from '../../../repositories/prisma-user.repository';
import { UserMapper } from '../../../mappers/user.mapper';
import { PrismaService } from '@libs/database';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { UserRole } from '../../../../domain/value-objects/user-role.enum';
import { UserRole as PrismaUserRole } from '@prisma/client';

// Mock del servicio de Prisma
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let userMapper: UserMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        UserMapper,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    userMapper = module.get<UserMapper>(UserMapper);
    
    // Limpiar mocks entre pruebas
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user entity when user exists', async () => {
      // Arrange
      const userId = '123';
      const prismaUser = {
        id: userId,
        authUserId: 'auth123',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: PrismaUserRole.PROFESSIONAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);
      
      // Act
      const result = await repository.findById(userId);
      
      // Assert
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).not.toBeNull();
      if (result) { // Comprobación de nulidad para TypeScript
        expect(result.id).toBe(userId);
        expect(result.firstName).toBe('Juan');
        expect(result.role).toBe(UserRole.PROFESSIONAL);
      }
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      // Act
      const result = await repository.findById('nonexistent');
      
      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });
  });

  describe('save', () => {
    it('should save a user entity correctly', async () => {
      // Arrange
      const userEntity = new UserEntity({
        id: '456',
        authUserId: 'auth456',
        firstName: 'María',
        lastName: 'López',
        role: UserRole.PATIENT,
      });
      
      const prismaUser = {
        id: '456',
        authUserId: 'auth456',
        firstName: 'María',
        lastName: 'López',
        role: PrismaUserRole.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.user.create.mockResolvedValue(prismaUser);
      
      // Act
      const result = await repository.save(userEntity);
      
      // Assert
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toBe('456');
        expect(result.firstName).toBe('María');
      }
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    });
  });
}); 