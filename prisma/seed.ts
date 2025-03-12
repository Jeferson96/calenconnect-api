/**
 * Archivo de semilla (seed) para la base de datos del proyecto CalenConnect
 *
 * Este script proporciona datos iniciales para todas las entidades del sistema,
 * permitiendo un funcionamiento básico y pruebas de la aplicación con datos realistas.
 *
 * La estructura está organizada por entidades, siguiendo un orden lógico que respeta
 * las dependencias y relaciones entre tablas.
 *
 * @author CalenConnect Team
 * @date Marzo 2025
 */

import {
  PrismaClient,
  UserRole,
  AppointmentStatus,
  NotificationType,
  User,
  Appointment,
  Availability,
  Notification,
  AuditLog,
  Configuration,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Inicialización del cliente de Prisma
const prisma = new PrismaClient();

/**
 * Muestra un spinner animado en la consola
 */
class Spinner {
  private frames: string[];
  private interval: NodeJS.Timeout | null;
  private message: string;
  private currentFrame: number;

  constructor() {
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.interval = null;
    this.message = '';
    this.currentFrame = 0;
  }

  start(message: string): void {
    this.message = message;
    this.currentFrame = 0;

    if (this.interval) {
      clearInterval(this.interval);
    }

    process.stdout.write('\n');

    this.interval = setInterval(() => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${this.frames[this.currentFrame]} ${this.message}`);
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 80);
  }

  update(message: string): void {
    this.message = message;
  }

  stop(message?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;

      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);

      if (message) {
        process.stdout.write(`✓ ${message}\n`);
      } else {
        process.stdout.write(`✓ ${this.message} (completado)\n`);
      }
    }
  }
}

const spinner = new Spinner();

/**
 * Función principal que ejecuta la semilla de datos
 */
async function main() {
  // Registro de tiempo - Inicio
  const startTime = new Date();
  const startTimeStr = startTime.toLocaleTimeString();

  console.log('\n🌱 INICIANDO PROCESO DE SEMILLA DE DATOS 🌱\n');
  console.log(`⏱️ Hora de inicio: ${startTimeStr}`);

  try {
    // Limpiamos los datos existentes
    spinner.start('Limpiando datos existentes...');
    await clearData();
    spinner.stop();

    // Creamos los datos en orden lógico según las dependencias
    spinner.start('Creando usuarios...');
    const { users, professionalCount, patientCount } = await seedUsers();
    spinner.stop(
      `Se crearon ${users.length} usuarios (${professionalCount} profesionales y ${patientCount} pacientes).`,
    );

    spinner.start('Creando disponibilidad para profesionales...');
    await seedAvailability(users);
    spinner.stop();

    spinner.start('Creando citas...');
    const appointments = await seedAppointments(users);
    spinner.stop(`Se crearon ${appointments.length} citas.`);

    spinner.start('Creando notificaciones...');
    await seedNotifications(users, appointments);
    spinner.stop();

    spinner.start('Creando registros de auditoría...');
    await seedAuditLogs(users);
    spinner.stop();

    spinner.start('Configurando sistema...');
    await seedConfiguration();
    spinner.stop();

    // Registro de tiempo - Finalización
    const endTime = new Date();
    const endTimeStr = endTime.toLocaleTimeString();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    // Formato de duración según el tiempo transcurrido
    let durationText = '';
    if (duration < 60) {
      durationText = `${duration.toFixed(2)} segundos`;
    } else {
      const minutes = Math.floor(duration / 60);
      const seconds = (duration % 60).toFixed(2);
      durationText = `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} y ${seconds} segundos`;
    }

    console.log('\n✅ PROCESO DE SEMILLA COMPLETADO EXITOSAMENTE ✅\n');
    console.log(`⏱️ Hora de inicio: ${startTimeStr}`);
    console.log(`⏱️ Hora de finalización: ${endTimeStr}`);
    console.log(`⏱️ Duración total: ${durationText}`);
  } catch (error) {
    handleError(error, 'main');
  }
}

/**
 * Maneja errores de forma detallada
 */
interface ErrorWithDetails {
  message?: string;
  code?: string;
  meta?: unknown;
  stack?: string;
}

function handleError(error: unknown, location: string): void {
  spinner.stop();
  console.error('\n❌ ERROR EN EL PROCESO DE SEMILLA ❌');
  console.error(`📍 Ubicación: ${location}`);

  const err = error as ErrorWithDetails;

  console.error(`📝 Descripción: ${err.message || 'Error desconocido'}`);

  if (err.code) {
    console.error(`🔑 Código: ${err.code}`);
  }

  if (err.meta) {
    console.error('📊 Metadatos:');
    console.error(err.meta);
  }

  console.error('\n🔍 Stack trace:');
  console.error(err.stack || 'No disponible');
  process.exit(1);
}

/**
 * Limpia todos los datos existentes en la base de datos
 * Se eliminan en orden inverso para respetar las restricciones de clave foránea
 */
async function clearData() {
  try {
    spinner.update('Eliminando notificaciones...');
    await prisma.notification.deleteMany({});

    spinner.update('Eliminando registros de auditoría...');
    await prisma.auditLog.deleteMany({});

    spinner.update('Eliminando citas...');
    await prisma.appointment.deleteMany({});

    spinner.update('Eliminando disponibilidad...');
    await prisma.availability.deleteMany({});

    spinner.update('Eliminando configuraciones...');
    await prisma.configuration.deleteMany({});

    spinner.update('Eliminando usuarios...');
    await prisma.user.deleteMany({});
  } catch (error) {
    handleError(error, 'clearData');
  }
}

/**
 * Crea usuarios de ejemplo con diferentes roles
 * @returns Objeto con array de usuarios creados y conteo por roles
 */
async function seedUsers(): Promise<{
  users: User[];
  professionalCount: number;
  patientCount: number;
}> {
  try {
    // Definimos los datos de usuarios
    const userData = [
      // Profesionales (10)
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Ana',
        lastName: 'Martínez',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Gabriela',
        lastName: 'Medina',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Javier',
        lastName: 'Herrera',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'María',
        lastName: 'Vargas',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Ricardo',
        lastName: 'Sánchez',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Patricia',
        lastName: 'González',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Andrés',
        lastName: 'Molina',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Lucía',
        lastName: 'Jiménez',
        role: UserRole.PROFESSIONAL,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Eduardo',
        lastName: 'Vega',
        role: UserRole.PROFESSIONAL,
      },
      // Pacientes (10)
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Elena',
        lastName: 'López',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Miguel',
        lastName: 'Fernández',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Laura',
        lastName: 'Gómez',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Daniel',
        lastName: 'Orrego',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Sofía',
        lastName: 'Marín',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Juan',
        lastName: 'Pereira',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Carolina',
        lastName: 'Duarte',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Francisco',
        lastName: 'Torres',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Valentina',
        lastName: 'Osorio',
        role: UserRole.PATIENT,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Mateo',
        lastName: 'Rivera',
        role: UserRole.PATIENT,
      },
    ];

    spinner.update(`Insertando ${userData.length} usuarios en la base de datos...`);

    // Utilizamos una transacción para mejorar el rendimiento
    const users = await prisma.$transaction(async (tx) => {
      // Insertamos todos los usuarios de una sola vez usando createMany
      await tx.user.createMany({
        data: userData,
      });

      // Consultamos los usuarios creados para obtener sus IDs generados
      return await tx.user.findMany({
        where: {
          id: {
            in: userData.map((user) => user.id),
          },
        },
      });
    });

    // Contamos usuarios por tipo
    const professionalCount = users.filter((user) => user.role === UserRole.PROFESSIONAL).length;
    const patientCount = users.filter((user) => user.role === UserRole.PATIENT).length;

    return { users, professionalCount, patientCount };
  } catch (error) {
    handleError(error, 'seedUsers');
    return { users: [], professionalCount: 0, patientCount: 0 };
  }
}

/**
 * Crea disponibilidad para los profesionales
 * @param users Array de usuarios creados previamente
 * @returns Array de disponibilidades creadas
 */
async function seedAvailability(users: User[]): Promise<Availability[]> {
  try {
    // Filtramos solo los profesionales
    const professionals = users.filter((user) => user.role === UserRole.PROFESSIONAL);
    spinner.update(`Preparando disponibilidad para ${professionals.length} profesionales...`);

    // Creamos disponibilidad para cada profesional
    const availabilityData: {
      id: string;
      professionalId: string;
      availableDate: Date;
      startTime: Date;
      endTime: Date;
      isBooked: boolean;
    }[] = [];

    // Para cada profesional, creamos slots de disponibilidad para los próximos 7 días
    let professionalCounter = 0;
    for (const professional of professionals) {
      professionalCounter++;
      spinner.update(
        `Generando slots para profesional ${professionalCounter}/${professionals.length}: ${professional.firstName} ${professional.lastName}...`,
      );

      // Creamos disponibilidad para los próximos 7 días
      for (let i = 0; i < 7; i++) {
        // Fecha base: hoy + i días
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + i);
        baseDate.setHours(0, 0, 0, 0);

        // Creamos slots de 1 hora desde las 9:00 hasta las 17:00
        for (let hour = 9; hour < 17; hour++) {
          const startTime = new Date(baseDate);
          startTime.setHours(hour, 0, 0, 0);

          const endTime = new Date(baseDate);
          endTime.setHours(hour + 1, 0, 0, 0);

          const isBooked = Math.random() > 0.7;

          availabilityData.push({
            id: uuidv4(),
            professionalId: professional.id,
            availableDate: baseDate,
            startTime,
            endTime,
            isBooked,
          });
        }
      }
    }

    spinner.update(
      `Insertando ${availabilityData.length} slots de disponibilidad en la base de datos...`,
    );

    // Utilizamos una transacción para mejorar el rendimiento
    const availability = await prisma.$transaction(async (tx) => {
      // Insertamos todos los registros de una sola vez usando createMany
      await tx.availability.createMany({
        data: availabilityData,
      });

      // Retornamos los datos insertados (sin consultar la BD de nuevo)
      return availabilityData as Availability[];
    });

    spinner.update(`Se crearon ${availability.length} slots de disponibilidad.`);
    return availability;
  } catch (error) {
    handleError(error, 'seedAvailability');
    return [];
  }
}

/**
 * Crea citas entre pacientes y profesionales
 * @param users Array de usuarios creados previamente
 * @returns Array de citas creadas
 */
async function seedAppointments(users: User[]): Promise<Appointment[]> {
  try {
    // Separamos usuarios por rol
    const professionals = users.filter((user) => user.role === UserRole.PROFESSIONAL);
    const patients = users.filter((user) => user.role === UserRole.PATIENT);

    // Fecha actual para referencia
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(now.getDate() + 2);
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    // Definimos datos de citas (ejemplos expandidos)
    const appointmentData = [
      // Citas programadas para el futuro cercano
      {
        id: uuidv4(),
        patientId: patients[0].id,
        professionalId: professionals[0].id,
        appointmentDate: tomorrow,
        status: AppointmentStatus.SCHEDULED,
      },
      {
        id: uuidv4(),
        patientId: patients[1].id,
        professionalId: professionals[0].id,
        appointmentDate: dayAfterTomorrow,
        status: AppointmentStatus.SCHEDULED,
      },
      // Citas programadas para la próxima semana
      {
        id: uuidv4(),
        patientId: patients[2].id,
        professionalId: professionals[1].id,
        appointmentDate: nextWeek,
        status: AppointmentStatus.SCHEDULED,
      },
      {
        id: uuidv4(),
        patientId: patients[3].id,
        professionalId: professionals[2].id,
        appointmentDate: new Date(nextWeek.setHours(nextWeek.getHours() + 2)),
        status: AppointmentStatus.SCHEDULED,
      },
      // Citas completadas recientemente
      {
        id: uuidv4(),
        patientId: patients[2].id,
        professionalId: professionals[1].id,
        appointmentDate: twoDaysAgo,
        status: AppointmentStatus.COMPLETED,
      },
      {
        id: uuidv4(),
        patientId: patients[4].id,
        professionalId: professionals[3].id,
        appointmentDate: lastWeek,
        status: AppointmentStatus.COMPLETED,
      },
      // Citas canceladas
      {
        id: uuidv4(),
        patientId: patients[0].id,
        professionalId: professionals[1].id,
        appointmentDate: yesterday,
        status: AppointmentStatus.CANCELLED,
      },
      {
        id: uuidv4(),
        patientId: patients[3].id,
        professionalId: professionals[4].id,
        appointmentDate: tomorrow,
        status: AppointmentStatus.CANCELLED,
      },
      // Adicional: cita programada para hoy
      {
        id: uuidv4(),
        patientId: patients[1].id,
        professionalId: professionals[2].id,
        appointmentDate: now,
        status: AppointmentStatus.SCHEDULED,
      },
      // Adicional: otra cita completada en el pasado
      {
        id: uuidv4(),
        patientId: patients[4].id,
        professionalId: professionals[0].id,
        appointmentDate: lastWeek,
        status: AppointmentStatus.COMPLETED,
      },
    ];

    spinner.update(`Insertando ${appointmentData.length} citas en la base de datos...`);

    // Utilizamos una transacción para mejorar el rendimiento
    const appointments = await prisma.$transaction(async (tx) => {
      // Insertamos todas las citas de una sola vez usando createMany
      await tx.appointment.createMany({
        data: appointmentData,
      });

      // Retornamos los datos insertados (sin consultar la BD de nuevo)
      return appointmentData as Appointment[];
    });

    return appointments;
  } catch (error) {
    handleError(error, 'seedAppointments');
    return [];
  }
}

/**
 * Crea notificaciones relacionadas con las citas
 * @param users Array de usuarios creados previamente
 * @param appointments Array de citas creadas previamente
 * @returns Array de notificaciones creadas
 */
async function seedNotifications(
  users: User[],
  appointments: Appointment[],
): Promise<Notification[]> {
  try {
    const notificationData: {
      id: string;
      userId: string;
      appointmentId: string;
      type: NotificationType;
      isSent: boolean;
      sentAt: Date | null;
    }[] = [];

    // Para cada cita, creamos notificaciones para el paciente y el profesional
    spinner.update('Preparando datos de notificaciones...');
    for (const appointment of appointments) {
      // Para el paciente
      notificationData.push({
        id: uuidv4(),
        userId: appointment.patientId,
        appointmentId: appointment.id,
        type: NotificationType.CONFIRMATION,
        isSent: true,
        sentAt: new Date(new Date().setHours(new Date().getHours() - 24)),
      });

      // Para el profesional
      notificationData.push({
        id: uuidv4(),
        userId: appointment.professionalId,
        appointmentId: appointment.id,
        type: NotificationType.CONFIRMATION,
        isSent: true,
        sentAt: new Date(new Date().setHours(new Date().getHours() - 24)),
      });

      // Notificación de recordatorio para citas programadas
      if (appointment.status === AppointmentStatus.SCHEDULED) {
        notificationData.push({
          id: uuidv4(),
          userId: appointment.patientId,
          appointmentId: appointment.id,
          type: NotificationType.REMINDER,
          isSent: false,
          sentAt: null,
        });
      }

      // Notificación de cancelación para citas canceladas
      if (appointment.status === AppointmentStatus.CANCELLED) {
        notificationData.push({
          id: uuidv4(),
          userId: appointment.patientId,
          appointmentId: appointment.id,
          type: NotificationType.CANCELLATION,
          isSent: true,
          sentAt: new Date(new Date().setHours(new Date().getHours() - 12)),
        });

        notificationData.push({
          id: uuidv4(),
          userId: appointment.professionalId,
          appointmentId: appointment.id,
          type: NotificationType.CANCELLATION,
          isSent: true,
          sentAt: new Date(new Date().setHours(new Date().getHours() - 12)),
        });
      }
    }

    spinner.update(`Insertando ${notificationData.length} notificaciones en la base de datos...`);

    // Utilizamos una transacción para mejorar el rendimiento
    const notifications = await prisma.$transaction(async (tx) => {
      // Insertamos todas las notificaciones de una sola vez usando createMany
      await tx.notification.createMany({
        data: notificationData,
      });

      // Retornamos los datos insertados (sin consultar la BD de nuevo)
      return notificationData as Notification[];
    });

    spinner.update(`Se crearon ${notifications.length} notificaciones.`);
    return notifications;
  } catch (error) {
    handleError(error, 'seedNotifications');
    return [];
  }
}

/**
 * Crea registros de auditoría para diferentes acciones
 * @param users Array de usuarios creados previamente
 * @returns Array de registros de auditoría creados
 */
async function seedAuditLogs(users: User[]): Promise<AuditLog[]> {
  try {
    const auditLogData = [
      // Registro de inicio de sesión
      {
        id: uuidv4(),
        userId: users[0].id,
        action: 'LOGIN',
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date().toISOString(),
        },
      },
      // Registro de creación de cita
      {
        id: uuidv4(),
        userId: users[2].id,
        action: 'CREATE_APPOINTMENT',
        metadata: {
          patientId: users[2].id,
          professionalId: users[0].id,
          appointmentDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        },
      },
      // Registro de cancelación de cita
      {
        id: uuidv4(),
        userId: users[3].id,
        action: 'CANCEL_APPOINTMENT',
        metadata: {
          appointmentId: uuidv4(),
          reason: 'Conflicto de horario',
        },
      },
      // Registro de actualización de perfil
      {
        id: uuidv4(),
        userId: users[1].id,
        action: 'UPDATE_PROFILE',
        metadata: {
          previousData: { firstName: 'Carlo', lastName: 'Rodriguez' },
          newData: { firstName: 'Carlos', lastName: 'Rodríguez' },
        },
      },
    ];

    spinner.update(`Insertando ${auditLogData.length} registros de auditoría...`);

    // Utilizamos una transacción para mejorar el rendimiento
    const transaction = await prisma.$transaction(async (tx) => {
      // Insertamos todos los registros de una sola vez usando createMany
      await tx.auditLog.createMany({
        data: auditLogData,
      });

      // Consultamos los registros creados para obtener sus datos completos
      return await tx.auditLog.findMany({
        where: {
          id: {
            in: auditLogData.map((log) => log.id),
          },
        },
      });
    });

    spinner.update(`Se crearon ${transaction.length} registros de auditoría.`);
    return transaction;
  } catch (error) {
    handleError(error, 'seedAuditLogs');
    return [];
  }
}

/**
 * Crea configuraciones del sistema
 * @returns Array de configuraciones creadas
 */
async function seedConfiguration(): Promise<Configuration[]> {
  try {
    const configData = [
      {
        id: uuidv4(),
        key: 'NOTIFICATION_REMINDER_HOURS',
        value: '24',
      },
      {
        id: uuidv4(),
        key: 'APPOINTMENT_CANCELLATION_LIMIT_HOURS',
        value: '6',
      },
      {
        id: uuidv4(),
        key: 'DEFAULT_APPOINTMENT_DURATION_MINUTES',
        value: '60',
      },
      {
        id: uuidv4(),
        key: 'SYSTEM_TIMEZONE',
        value: 'America/Bogota',
      },
    ];

    spinner.update(`Insertando ${configData.length} configuraciones del sistema...`);

    // Utilizamos una transacción para mejorar el rendimiento
    const configurations = await prisma.$transaction(async (tx) => {
      // Insertamos todas las configuraciones de una sola vez usando createMany
      await tx.configuration.createMany({
        data: configData,
      });

      // Consultamos las configuraciones creadas
      return await tx.configuration.findMany({
        where: {
          id: {
            in: configData.map((config) => config.id),
          },
        },
      });
    });

    spinner.update(`Se crearon ${configurations.length} configuraciones del sistema.`);
    return configurations;
  } catch (error) {
    handleError(error, 'seedConfiguration');
    return [];
  }
}

// Ejecutamos la función principal
void main().finally(() => {
  // Cerramos la conexión a la base de datos
  void prisma.$disconnect();
});
