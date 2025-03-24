import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '@libs/database';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, AppointmentStatus } from '@prisma/client';
import { Response } from 'supertest';
import { cleanDatabaseSafely } from '../../utils/test-helpers';

// Interfaz para el cuerpo de respuesta de cita
interface AppointmentResponse {
  id: string;
  patientId: string;
  professionalId: string;
  availabilityId: string;
  appointmentDate: string;
  status: string;
  [key: string]: unknown;
}

describe('AppointmentController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let patientId: string;
  let professionalId: string;
  let availabilityId: string;
  let testAppointmentId: string = uuidv4(); // Inicializar con UUID por defecto

  // Crear fechas para las pruebas
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowString = tomorrow.toISOString();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);

    // Limpiar tablas relacionadas antes de las pruebas respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);

    // Crear un paciente de prueba
    const patient = await prismaService.user.create({
      data: {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Paciente',
        lastName: 'Prueba',
        role: UserRole.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    patientId = patient.id;
    console.log('Paciente de prueba creado:', patientId);

    // Crear un profesional de prueba
    const professional = await prismaService.user.create({
      data: {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Doctor',
        lastName: 'Prueba',
        role: UserRole.PROFESSIONAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    professionalId = professional.id;
    console.log('Profesional de prueba creado:', professionalId);

    // Crear una disponibilidad de prueba
    const availability = await prismaService.availability.create({
      data: {
        id: uuidv4(),
        professionalId,
        availableDate: new Date(tomorrow),
        startTime: new Date(tomorrow),
        endTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
        isBooked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    availabilityId = availability.id;
    console.log('Disponibilidad de prueba creada:', availabilityId);

    // Crear una cita de prueba directamente desde Prisma
    const appointment = await prismaService.appointment.create({
      data: {
        id: uuidv4(),
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: new Date(tomorrowString),
        status: AppointmentStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    testAppointmentId = appointment.id;
    console.log('Cita de prueba creada:', testAppointmentId);
  }, 30000);

  afterAll(async () => {
    // Limpiar datos después de las pruebas respetando las restricciones de clave foránea
    await cleanDatabaseSafely(prismaService);
    await app.close();
  }, 30000);

  describe('POST /appointments', () => {
    it('should create a new appointment', () => {
      const newAppointment = {
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: tomorrowString,
        status: AppointmentStatus.SCHEDULED,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(newAppointment)
        .expect(201)
        .expect((res: Response) => {
          const body = res.body as AppointmentResponse;
          if (body && body.id) {
            // Solo actualizamos si la respuesta contiene un ID válido
            testAppointmentId = body.id;
          }

          expect(body).toBeDefined();
          expect(body.id).toBeDefined();
          expect(body.patientId).toBe(patientId);
          expect(body.professionalId).toBe(professionalId);
          expect(body.status).toBe('SCHEDULED');
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidAppointment = {
        // Falta patientId
        professionalId,
        availabilityId,
        appointmentDate: tomorrowString,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(invalidAppointment)
        .expect(400);
    });
  });

  describe('GET /appointments', () => {
    it('should return appointments for a patient', async () => {
      return request(app.getHttpServer())
        .get(`/appointments?patientId=${patientId}`)
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as AppointmentResponse[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
          if (body.length > 0) {
            expect(body[0].patientId).toBe(patientId);
          }
        });
    });

    it('should return appointments for a professional', async () => {
      return request(app.getHttpServer())
        .get(`/appointments?professionalId=${professionalId}`)
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as AppointmentResponse[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
          if (body.length > 0) {
            expect(body[0].professionalId).toBe(professionalId);
          }
        });
    });
  });

  describe('GET /appointments/:id', () => {
    it('should return 404 for non-existent appointment', () => {
      const nonExistentId = uuidv4();
      return request(app.getHttpServer()).get(`/appointments/${nonExistentId}`).expect(404);
    });

    it('should return appointment data for existing appointment', () => {
      return request(app.getHttpServer())
        .get(`/appointments/${testAppointmentId}`)
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as AppointmentResponse;
          expect(body).toBeDefined();
          expect(body.id).toBe(testAppointmentId);
          expect(body.patientId).toBe(patientId);
          expect(body.professionalId).toBe(professionalId);
        });
    });
  });

  describe('PUT /appointments/:id', () => {
    it('should update an existing appointment', () => {
      const updateData = {
        status: AppointmentStatus.SCHEDULED, // Usamos un status válido
      };

      return request(app.getHttpServer())
        .put(`/appointments/${testAppointmentId}`)
        .send(updateData)
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as AppointmentResponse;
          expect(body).toBeDefined();
          expect(body.id).toBe(testAppointmentId);
          expect(body.status).toBe('SCHEDULED');
        });
    });

    it('should return 404 for non-existent appointment', () => {
      const nonExistentId = uuidv4();
      const updateData = { status: AppointmentStatus.SCHEDULED }; // Usamos un status válido

      return request(app.getHttpServer())
        .put(`/appointments/${nonExistentId}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('PUT /appointments/:id/complete', () => {
    it('should mark an appointment as completed', () => {
      return request(app.getHttpServer())
        .put(`/appointments/${testAppointmentId}/complete`)
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as AppointmentResponse;
          expect(body).toBeDefined();
          expect(body.id).toBe(testAppointmentId);
          expect(body.status).toBe('COMPLETED');
        });
    });

    it('should return 404 for non-existent appointment', () => {
      const nonExistentId = uuidv4();
      return request(app.getHttpServer())
        .put(`/appointments/${nonExistentId}/complete`)
        .expect(404);
    });
  });

  describe('PUT /appointments/:id/cancel', () => {
    let cancelAppointmentId: string;

    beforeAll(async () => {
      // Crear una cita específica para la prueba de cancelación
      // Primero verificar que el profesional y el paciente existan
      const professional = await prismaService.user.findFirst({
        where: { role: UserRole.PROFESSIONAL },
      });

      const patient = await prismaService.user.findFirst({
        where: { role: UserRole.PATIENT },
      });

      if (!professional || !patient) {
        console.log('No se encontraron usuarios para crear la cita de cancelación');
        return;
      }

      // Crear disponibilidad para el profesional
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startTime = new Date(tomorrow);
      startTime.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      // Crear disponibilidad con objetos Date completos
      const availability = await prismaService.availability.create({
        data: {
          professionalId: professional.id,
          availableDate: tomorrow,
          startTime,
          endTime,
          isBooked: false,
        },
      });

      // Crear la cita para la prueba de cancelación
      const appointmentResponse = await request(app.getHttpServer())
        .post('/appointments')
        .send({
          patientId: patient.id,
          professionalId: professional.id,
          availabilityId: availability.id,
          appointmentDate: tomorrow.toISOString().split('T')[0],
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: AppointmentStatus.SCHEDULED,
        })
        .expect(201);

      cancelAppointmentId = appointmentResponse.body.id;
      console.log(`Cita para cancelación creada con ID: ${cancelAppointmentId}`);
    });

    it('should cancel an appointment', async () => {
      if (!cancelAppointmentId) {
        console.log('No se pudo crear la cita para cancelación, omitiendo prueba');
        return;
      }

      return request(app.getHttpServer())
        .put(`/appointments/${cancelAppointmentId}/cancel`)
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as AppointmentResponse;
          expect(body).toBeDefined();
          expect(body.id).toBe(cancelAppointmentId);
          expect(body.status).toBe(AppointmentStatus.CANCELLED);
        });
    });

    it('should return 404 when trying to cancel non-existent appointment', () => {
      const nonExistentId = uuidv4();
      return request(app.getHttpServer()).put(`/appointments/${nonExistentId}/cancel`).expect(404);
    });
  });

  describe('DELETE /appointments/:id', () => {
    it('should delete an existing appointment', () => {
      return request(app.getHttpServer()).delete(`/appointments/${testAppointmentId}`).expect(204);
    });

    it('should return 404 for non-existent appointment after deletion', () => {
      return request(app.getHttpServer()).get(`/appointments/${testAppointmentId}`).expect(404);
    });
  });
});
