import { PrismaService } from '@libs/database';
import { UserRole, AppointmentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utilidad para crear datos de prueba de forma consistente
 */
export class TestDataFactory {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un usuario de prueba
   */
  async createTestUser(role: UserRole = UserRole.PATIENT, firstName = 'Test', lastName = 'User') {
    return await this.prisma.user.create({
      data: {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Crea un paciente de prueba
   */
  async createTestPatient(firstName = 'Paciente', lastName = 'Prueba') {
    return this.createTestUser(UserRole.PATIENT, firstName, lastName);
  }

  /**
   * Crea un profesional de prueba
   */
  async createTestProfessional(firstName = 'Doctor', lastName = 'Prueba') {
    return this.createTestUser(UserRole.PROFESSIONAL, firstName, lastName);
  }

  /**
   * Crea una disponibilidad de prueba para un profesional
   */
  async createTestAvailability(professionalId: string, isBooked = false) {
    // Crear fechas para mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);

    return await this.prisma.availability.create({
      data: {
        id: uuidv4(),
        professionalId,
        availableDate: tomorrow,
        startTime: tomorrow,
        endTime,
        isBooked,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Crea una cita de prueba
   */
  async createTestAppointment(
    patientId: string,
    professionalId: string,
    availabilityId: string,
    status = AppointmentStatus.SCHEDULED,
  ) {
    // Crear fecha para mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    return await this.prisma.appointment.create({
      data: {
        id: uuidv4(),
        patientId,
        professionalId,
        availabilityId,
        appointmentDate: tomorrow,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Crea todos los datos necesarios para pruebas de citas
   * Devuelve todos los datos creados en un objeto
   */
  async setupAppointmentTestData() {
    // 1. Crear usuarios
    const patient = await this.createTestPatient();
    const professional = await this.createTestProfessional();

    // 2. Crear disponibilidad
    const availability = await this.createTestAvailability(professional.id);

    // 3. Crear cita
    const appointment = await this.createTestAppointment(
      patient.id,
      professional.id,
      availability.id,
    );

    return {
      patient,
      professional,
      availability,
      appointment,
    };
  }
}
