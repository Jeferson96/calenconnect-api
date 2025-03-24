import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '@libs/database';
import { v4 as uuidv4 } from 'uuid';
import { UserRole as PrismaUserRole, User } from '@prisma/client';
import { Response } from 'supertest';
import { cleanDatabaseSafely } from '../../utils/test-helpers';

// Interfaz para el cuerpo de respuesta de usuario
interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: unknown;
}

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testUser: User; // Tipado para el usuario de prueba

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);

    // Limpiar las tablas relacionadas antes de las pruebas respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);

    // Crear un usuario de prueba para usar en las pruebas
    testUser = await prismaService.user.create({
      data: {
        id: uuidv4(), // Generar un UUID válido
        authUserId: uuidv4(), // También usar UUID para authUserId
        firstName: 'E2E',
        lastName: 'Test',
        role: PrismaUserRole.PATIENT, // Usar el enum de Prisma
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Usuario de prueba creado:', testUser.id);
  }, 30000);

  afterAll(async () => {
    // Limpiar datos después de las pruebas respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);
    await app.close();
  }, 30000);

  describe('GET /users/:id', () => {
    it('should return 404 for non-existent user', () => {
      const nonExistentId = uuidv4(); // Usar un UUID válido pero que no existe
      return request(app.getHttpServer()).get(`/users/${nonExistentId}`).expect(404);
    });

    it('should return user data for existing user', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}`)
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as UserResponse;
          expect(body).toBeDefined();
          expect(body.id).toBe(testUser.id);
          expect(body.firstName).toBe('E2E');
          expect(body.lastName).toBe('Test');
        });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      const newUser = {
        authUserId: uuidv4(),
        firstName: 'Nuevo',
        lastName: 'Usuario',
        role: 'PATIENT',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(newUser)
        .expect(201)
        .expect((res: Response) => {
          const body = res.body as UserResponse;
          expect(body).toBeDefined();
          expect(body.id).toBeDefined();
          expect(body.firstName).toBe('Nuevo');
          expect(body.lastName).toBe('Usuario');
          expect(body.role).toBe('PATIENT');
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidUser = {
        firstName: 'Incompleto',
        // Faltan campos obligatorios
      };

      return request(app.getHttpServer()).post('/users').send(invalidUser).expect(400);
    });
  });
});
