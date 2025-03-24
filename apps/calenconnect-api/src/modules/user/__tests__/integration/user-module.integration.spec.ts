import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../application/user.service';
import { UserModule } from '../../user.module';
import { DatabaseModule } from '@libs/database';
import { PrismaService } from '@libs/database';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/value-objects/user-role.enum';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserCommand } from '../../application/commands/create-user.command';

describe('UserModule Integration Tests', () => {
  let moduleRef: TestingModule;
  let userService: UserService;
  let prismaService: PrismaService;
  
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule, DatabaseModule],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Limpiar la base de datos en el orden correcto para respetar las restricciones de clave foránea
    await prismaService.notification.deleteMany({});
    await prismaService.appointment.deleteMany({});
    await prismaService.availability.deleteMany({});
    await prismaService.auditLog.deleteMany({});
    await prismaService.user.deleteMany({});
  }, 20000);

  describe('createUser', () => {
    it('should create a new user entity and save it to database', async () => {
      // Arrange
      const authUserId = uuidv4();
      const command = new CreateUserCommand(
        authUserId,
        'Test',
        'Integration',
        UserRole.PROFESSIONAL,
      );

      // Act
      const savedUser = await userService.createUser(command);

      // Assert
      expect(savedUser).toBeDefined();
      expect(savedUser).toBeInstanceOf(UserEntity);
      expect(savedUser.authUserId).toBe(authUserId);
      expect(savedUser.firstName).toBe('Test');
      expect(savedUser.lastName).toBe('Integration');
      expect(savedUser.role).toBe(UserRole.PROFESSIONAL);

      // Verificar persistencia en base de datos
      const dbUser = await prismaService.user.findUnique({
        where: { authUserId },
      });
      expect(dbUser).toBeDefined();
      if (dbUser) {
        expect(dbUser.firstName).toBe('Test');
        expect(dbUser.lastName).toBe('Integration');
      }
    }, 20000);
  });

  describe('findUserById', () => {
    it('should retrieve an existing user from database', async () => {
      // Arrange - Crear un usuario para la prueba usando directamente el servicio
      const authUserId = uuidv4();
      const command = new CreateUserCommand(
        authUserId, 'Existing', 'User', UserRole.PATIENT
      );
      
      // Creamos el usuario usando el servicio en lugar de Prisma directamente
      const createdUser = await userService.createUser(command);
      expect(createdUser).toBeDefined();
      expect(createdUser.authUserId).toBe(authUserId);
      
      // Guarda el ID generado para usarlo en la consulta
      const userId = createdUser.id;
      
      // Act - Ahora buscamos el usuario por su ID
      const user = await userService.findUserById(userId);

      // Assert
      expect(user).toBeDefined();
      expect(user).not.toBeNull();
      
      if (user) {
        expect(user).toBeInstanceOf(UserEntity);
        expect(user.id).toBe(userId);
        expect(user.firstName).toBe('Existing');
        expect(user.lastName).toBe('User');
        expect(user.role).toBe(UserRole.PATIENT);
      }
    }, 20000);

    it('should return null for non-existent user', async () => {
      // Arrange
      const nonExistentId = uuidv4();

      // Act
      const user = await userService.findUserById(nonExistentId);

      // Assert
      expect(user).toBeNull();
    }, 20000);
  });
}); 