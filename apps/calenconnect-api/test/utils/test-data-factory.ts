import { PrismaService } from '@libs/database';
import { v4 as uuidv4 } from 'uuid';
import { User, Availability, Appointment, Notification, UserRole, AppointmentStatus } from '@prisma/client';

/**
 * Fábrica de datos de prueba para crear entidades relacionadas consistentes
 * para las pruebas de integración y e2e
 */
export class TestDataFactory {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un usuario de prueba con el rol de paciente
   */
  async createTestPatient(firstName = 'Paciente', lastName = 'Prueba'): Promise<User> {
    try {
      const patient = await this.prisma.user.create({
        data: {
          id: uuidv4(),
          authUserId: uuidv4(),
          firstName,
          lastName,
          role: UserRole.PATIENT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return patient;
    } catch (error) {
      console.error('Error al crear paciente de prueba:', error);
      throw new Error('No se pudo crear el paciente de prueba');
    }
  }

  /**
   * Crea un usuario de prueba con el rol de profesional
   */
  async createTestProfessional(firstName = 'Profesional', lastName = 'Prueba'): Promise<User> {
    try {
      const professional = await this.prisma.user.create({
        data: {
          id: uuidv4(),
          authUserId: uuidv4(),
          firstName,
          lastName,
          role: UserRole.PROFESSIONAL,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return professional;
    } catch (error) {
      console.error('Error al crear profesional de prueba:', error);
      throw new Error('No se pudo crear el profesional de prueba');
    }
  }

  /**
   * Crea una disponibilidad de prueba para un profesional
   */
  async createTestAvailability(professionalId: string, isBooked = false): Promise<Availability> {
    try {
      // Verificamos que el profesional existe antes de crear la disponibilidad
      const professionalExists = await this.prisma.user.findUnique({
        where: { id: professionalId }
      });

      if (!professionalExists) {
        throw new Error(`El profesional con ID ${professionalId} no existe`);
      }

      // Fecha de mañana para la disponibilidad
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);

      // Fin de la disponibilidad (1 hora después)
      const endTime = new Date(tomorrow);
      endTime.setHours(endTime.getHours() + 1);

      const availability = await this.prisma.availability.create({
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
      return availability;
    } catch (error) {
      console.error('Error al crear disponibilidad de prueba:', error);
      throw new Error(`No se pudo crear la disponibilidad para el profesional ${professionalId}`);
    }
  }

  /**
   * Crea una cita de prueba
   */
  async createTestAppointment(
    patientId: string, 
    professionalId: string, 
    availabilityId: string, 
    status = AppointmentStatus.SCHEDULED
  ): Promise<Appointment> {
    try {
      // Verificamos que el paciente existe
      const patientExists = await this.prisma.user.findUnique({
        where: { id: patientId }
      });

      if (!patientExists) {
        throw new Error(`El paciente con ID ${patientId} no existe`);
      }

      // Verificamos que la disponibilidad existe y pertenece al profesional
      const availabilityExists = await this.prisma.availability.findUnique({
        where: { id: availabilityId }
      });

      if (!availabilityExists) {
        throw new Error(`La disponibilidad con ID ${availabilityId} no existe`);
      }

      if (availabilityExists.professionalId !== professionalId) {
        throw new Error(`La disponibilidad no pertenece al profesional ${professionalId}`);
      }

      // Fecha para la cita (usar la misma de la disponibilidad)
      const appointmentDate = availabilityExists.availableDate;

      // Crear la cita
      const appointment = await this.prisma.appointment.create({
        data: {
          id: uuidv4(),
          patientId,
          professionalId,
          availabilityId,
          appointmentDate,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Actualizar la disponibilidad como reservada
      await this.prisma.availability.update({
        where: { id: availabilityId },
        data: { isBooked: true }
      });

      return appointment;
    } catch (error) {
      console.error('Error al crear cita de prueba:', error);
      throw new Error('No se pudo crear la cita de prueba');
    }
  }

  /**
   * Configura datos completos para pruebas de appointment
   * Crea un paciente, un profesional, una disponibilidad y una cita
   */
  async setupAppointmentTestData(): Promise<{
    patient: User;
    professional: User;
    availability: Availability;
    appointment: Appointment;
  }> {
    try {
      // Crear un paciente de prueba
      const patient = await this.createTestPatient();
      console.log(`Paciente de prueba creado con ID: ${patient.id}`);

      // Crear un profesional de prueba
      const professional = await this.createTestProfessional();
      console.log(`Profesional de prueba creado con ID: ${professional.id}`);

      // Crear una disponibilidad para el profesional
      const availability = await this.createTestAvailability(professional.id);
      console.log(`Disponibilidad de prueba creada con ID: ${availability.id}`);

      // Crear una cita
      const appointment = await this.createTestAppointment(
        patient.id,
        professional.id,
        availability.id
      );
      console.log(`Cita de prueba creada con ID: ${appointment.id}`);

      return {
        patient,
        professional,
        availability,
        appointment,
      };
    } catch (error) {
      console.error('Error al configurar datos de prueba para citas:', error);
      throw error;
    }
  }

  /**
   * Configura datos de disponibilidad para pruebas
   */
  async setupAvailabilityTestData(): Promise<{
    professional: User;
    availability: Availability;
  }> {
    try {
      // Crear un profesional de prueba
      const professional = await this.createTestProfessional();
      console.log(`Profesional de prueba creado con ID: ${professional.id}`);

      // Crear una disponibilidad para el profesional
      const availability = await this.createTestAvailability(professional.id);
      console.log(`Disponibilidad de prueba creada con ID: ${availability.id}`);

      return {
        professional,
        availability,
      };
    } catch (error) {
      console.error('Error al configurar datos de prueba para disponibilidad:', error);
      throw error;
    }
  }
}
