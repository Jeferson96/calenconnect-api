import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Clase de ayuda para crear datos de prueba
 */
export class TestDataHelpers {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Limpia todas las tablas de la base de datos
   */
  async cleanDatabase(): Promise<void> {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`);

    try {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.join(', ')} CASCADE;`);
    } catch (error) {
      console.error('Error al limpiar la base de datos:', error);
    }
  }

  /**
   * Crea un usuario de prueba
   */
  async createUser(
    overrides: Partial<{
      id: string;
      authUserId: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    }> = {},
  ) {
    const id = overrides.id || uuidv4();
    const now = new Date();

    return this.prisma.user.create({
      data: {
        id,
        authUserId: overrides.authUserId || uuidv4(),
        firstName: overrides.firstName || 'Test',
        lastName: overrides.lastName || 'User',
        role: overrides.role || UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  /**
   * Crea una disponibilidad de prueba
   */
  async createAvailability(
    professionalId: string,
    overrides: Partial<{
      id: string;
      availableDate: Date;
      startTime: Date;
      endTime: Date;
    }> = {},
  ) {
    const id = overrides.id || uuidv4();
    const now = new Date();
    const availableDate = overrides.availableDate || new Date(now.getTime() + 3600000); // 1 hora en el futuro
    const startTime = overrides.startTime || new Date(now.getTime() + 3600000); // 1 hora en el futuro
    const endTime = overrides.endTime || new Date(now.getTime() + 7200000); // 2 horas en el futuro

    return this.prisma.availability.create({
      data: {
        id,
        professionalId,
        availableDate,
        startTime,
        endTime,
        isBooked: false,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  /**
   * Crea una cita de prueba
   */
  async createAppointment(
    professionalId: string,
    patientId: string,
    availabilityId: string,
    overrides: Partial<{
      id: string;
      appointmentDate: Date;
      status: AppointmentStatus;
    }> = {},
  ) {
    const id = overrides.id || uuidv4();
    const now = new Date();
    const appointmentDate = overrides.appointmentDate || new Date(now.getTime() + 3600000); // 1 hora en el futuro

    return this.prisma.appointment.create({
      data: {
        id,
        professionalId,
        patientId,
        availabilityId,
        appointmentDate,
        status: overrides.status || AppointmentStatus.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
    });
  }
}
