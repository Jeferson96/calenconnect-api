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

// Configuración de zona horaria
const DEFAULT_TIMEZONE = 'America/Bogota'; // Zona horaria para Colombia

/**
 * Crea una fecha ajustada a la zona horaria local
 * @param date Fecha base (opcional, por defecto es la fecha actual)
 * @returns Fecha ajustada a la zona horaria local y con compensación para almacenamiento en BD
 */
function createLocalDate(date = new Date()) {
  // Convertimos la fecha a la zona horaria local primero
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: DEFAULT_TIMEZONE }));

  // Ahora, para asegurar que se guarde correctamente en la base de datos
  // Creamos la fecha como si fuera UTC pero con los valores locales
  const offsetAdjustedDate = new Date(
    Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes(),
      localDate.getSeconds(),
      localDate.getMilliseconds(),
    ),
  );

  return offsetAdjustedDate;
}

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

// Constantes de UUIDs para usuarios de ejemplo
const ANA_PROFESSIONAL_UUID = '2ab527d4-dc2a-4da7-a329-084e2378bc7e'; // Ana Martínez (xodedak293@amgens.com)
const ELENA_PATIENT_UUID = '3b12a062-2678-49c9-81cb-3d4f7fbcbef1'; // Elena López (cadaj82929@amgens.com)
const MIGUEL_PATIENT_UUID = '8aba097e-8c7a-4ba7-82f4-e8c578a6edee'; // Miguel Fernández (rofijo8238@amgens.com)
const CARLOS_PROFESSIONAL_UUID = '02985d67-0fa3-4148-a53b-1cf91b14c97e'; // Carlos Rodríguez (kilomi8050@avulos.com)

/**
 * Función principal que ejecuta la semilla de datos
 */
async function main() {
  // Registro de tiempo - Inicio
  const startTime = createLocalDate();
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
    const endTime = createLocalDate();
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
    // Definimos fecha para created_at y updated_at
    const now = createLocalDate();

    // Definimos los datos de usuarios
    const userData = [
      // Profesional de ejemplo con UUID fijo
      {
        id: ANA_PROFESSIONAL_UUID, // Ana Martínez (xodedak293@amgens.com)
        authUserId: uuidv4(),
        firstName: 'Ana',
        lastName: 'Martínez',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      // Paciente de ejemplo con UUID fijo
      {
        id: ELENA_PATIENT_UUID, // Elena López (cadaj82929@amgens.com)
        authUserId: uuidv4(),
        firstName: 'Elena',
        lastName: 'López',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      // Profesionales (10)
      {
        id: CARLOS_PROFESSIONAL_UUID, // Carlos Rodríguez (kilomi8050@avulos.com)
        authUserId: uuidv4(),
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Gabriela',
        lastName: 'Medina',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Javier',
        lastName: 'Herrera',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'María',
        lastName: 'Vargas',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Ricardo',
        lastName: 'Sánchez',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Patricia',
        lastName: 'González',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Andrés',
        lastName: 'Molina',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Lucía',
        lastName: 'Jiménez',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Eduardo',
        lastName: 'Vega',
        role: UserRole.PROFESSIONAL,
        createdAt: now,
        updatedAt: now,
      },
      // Pacientes (10)
      {
        id: MIGUEL_PATIENT_UUID, // Miguel Fernández (rofijo8238@amgens.com)
        authUserId: uuidv4(),
        firstName: 'Miguel',
        lastName: 'Fernández',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Laura',
        lastName: 'Gómez',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Daniel',
        lastName: 'Orrego',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Sofía',
        lastName: 'Marín',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Juan',
        lastName: 'Pereira',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Carolina',
        lastName: 'Duarte',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Francisco',
        lastName: 'Torres',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Valentina',
        lastName: 'Osorio',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        authUserId: uuidv4(),
        firstName: 'Mateo',
        lastName: 'Rivera',
        role: UserRole.PATIENT,
        createdAt: now,
        updatedAt: now,
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

    // Definimos fecha para created_at y updated_at
    const now = createLocalDate();

    const availabilityData: {
      id: string;
      professionalId: string;
      availableDate: Date;
      startTime: Date;
      endTime: Date;
      isBooked: boolean;
      createdAt: Date;
      updatedAt: Date;
    }[] = [];

    // Definimos franjas horarias específicas (bloques de 1 hora)
    const timeSlots = [
      { start: 8, end: 9 }, // 8:00 - 9:00
      { start: 9, end: 10 }, // 9:00 - 10:00
      { start: 10, end: 11 }, // 10:00 - 11:00
      { start: 11, end: 12 }, // 11:00 - 12:00
      { start: 14, end: 15 }, // 14:00 - 15:00
      { start: 15, end: 16 }, // 15:00 - 16:00
      { start: 16, end: 17 }, // 16:00 - 17:00
      { start: 17, end: 18 }, // 17:00 - 18:00
      { start: 18, end: 20 }, // 18:00 - 20:00 (último bloque de 2 horas)
    ];

    // Para cada profesional, generamos disponibilidad para los próximos 30 días
    let professionalCounter = 0;
    for (const professional of professionals) {
      professionalCounter++;
      spinner.update(
        `Generando slots para profesional ${professionalCounter}/${professionals.length}: ${professional.firstName} ${professional.lastName}...`,
      );

      // Generamos disponibilidad para los próximos 30 días
      for (let i = 1; i <= 30; i++) {
        const baseDate = createLocalDate();
        baseDate.setDate(baseDate.getDate() + i);
        baseDate.setHours(0, 0, 0, 0);

        // Saltamos los domingos (0 = domingo, 6 = sábado)
        if (baseDate.getDay() === 0) continue;

        // Para los profesionales con UUID fijo, aseguramos disponibilidad específica
        if (
          professional.id === ANA_PROFESSIONAL_UUID ||
          professional.id === CARLOS_PROFESSIONAL_UUID
        ) {
          // Aseguramos disponibilidad para franjas clave (necesarias para las citas de pacientes con UUID fijo)
          // Pasadas, futuras y canceladas en horarios diferentes

          // Disponibilidad para citas pasadas
          if (i <= 15) {
            // Para cubrir fechas pasadas (hasta 15 días atrás)
            const pastDate1 = createLocalDate(baseDate);
            pastDate1.setDate(baseDate.getDate() - 15); // 15 días atrás
            if (pastDate1.getDay() !== 0) {
              // Evitamos domingos
              pastDate1.setHours(9, 0, 0, 0);
              availabilityData.push(
                createAvailabilitySlot(professional.id, pastDate1, 9, 10, false, now),
              );
            }

            const pastDate2 = createLocalDate(baseDate);
            pastDate2.setDate(baseDate.getDate() - 7); // 7 días atrás
            if (pastDate2.getDay() !== 0) {
              // Evitamos domingos
              pastDate2.setHours(10, 0, 0, 0);
              availabilityData.push(
                createAvailabilitySlot(professional.id, pastDate2, 10, 11, false, now),
              );
            }

            // Para citas canceladas
            const cancelledDate = createLocalDate(baseDate);
            cancelledDate.setDate(baseDate.getDate() - 3); // 3 días atrás
            if (cancelledDate.getDay() !== 0) {
              // Evitamos domingos
              cancelledDate.setHours(11, 0, 0, 0);
              availabilityData.push(
                createAvailabilitySlot(professional.id, cancelledDate, 11, 12, false, now),
              );
            }
          }

          // Disponibilidad para citas futuras
          if (i >= 7 && i <= 14) {
            // 7 a 14 días adelante
            // Primera cita futura: 7 días adelante
            const futureDate1 = createLocalDate(baseDate);
            futureDate1.setDate(now.getDate() + 7);
            if (futureDate1.getDay() !== 0) {
              // Evitamos domingos
              futureDate1.setHours(14, 0, 0, 0);
              availabilityData.push(
                createAvailabilitySlot(professional.id, futureDate1, 14, 15, false, now),
              );
            }

            // Segunda cita futura: 14 días adelante
            const futureDate2 = createLocalDate(baseDate);
            futureDate2.setDate(now.getDate() + 14);
            if (futureDate2.getDay() !== 0) {
              // Evitamos domingos
              futureDate2.setHours(15, 0, 0, 0);
              availabilityData.push(
                createAvailabilitySlot(professional.id, futureDate2, 15, 16, false, now),
              );
            }
          }
        }

        // Generamos slots regulares para todos los profesionales
        const slotsForDay = Math.floor(Math.random() * (timeSlots.length - 2)) + 2; // Al menos 2 slots por día
        const selectedSlots = new Set<number>();

        // Aseguramos que el último slot del día (18-20) esté siempre presente
        selectedSlots.add(timeSlots.length - 1);

        // Seleccionamos slots aleatorios hasta completar la cantidad deseada
        while (selectedSlots.size < slotsForDay) {
          const slotIndex = Math.floor(Math.random() * (timeSlots.length - 1)); // Excluimos el último (ya incluido)
          selectedSlots.add(slotIndex);
        }

        // Creamos los slots de disponibilidad para los índices seleccionados
        for (const slotIndex of selectedSlots) {
          const slot = timeSlots[slotIndex];
          const slotDate = createLocalDate(baseDate);
          slotDate.setHours(slot.start, 0, 0, 0);

          // Agregamos el slot de disponibilidad
          availabilityData.push(
            createAvailabilitySlot(professional.id, slotDate, slot.start, slot.end, false, now),
          );
        }
      }
    }

    // Función auxiliar para crear slot de disponibilidad
    function createAvailabilitySlot(
      professionalId: string,
      baseDate: Date,
      startHour: number,
      endHour: number,
      isBooked: boolean,
      now: Date,
    ) {
      const startTime = createLocalDate(baseDate);
      startTime.setHours(startHour, 0, 0, 0);

      const endTime = createLocalDate(baseDate);
      endTime.setHours(endHour, 0, 0, 0);

      return {
        id: uuidv4(),
        professionalId,
        availableDate: baseDate,
        startTime,
        endTime,
        isBooked,
        createdAt: now,
        updatedAt: now,
      };
    }

    spinner.update(
      `Insertando ${availabilityData.length} slots de disponibilidad en la base de datos...`,
    );

    // Utilizamos una transacción para mejorar el rendimiento
    const availability = await prisma.$transaction(async (tx) => {
      await tx.availability.createMany({
        data: availabilityData,
      });
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
    const now = createLocalDate();

    // Obtenemos todas las disponibilidades existentes
    const availabilities = await prisma.availability.findMany({
      where: {
        isBooked: false,
      },
    });

    // Mapeamos las disponibilidades por profesional y fecha para fácil acceso
    const availabilityMap: Record<string, Record<string, Availability[]>> = {};

    for (const availability of availabilities) {
      const professionalId = availability.professionalId;
      const dateKey = availability.availableDate.toDateString();

      if (!availabilityMap[professionalId]) {
        availabilityMap[professionalId] = {};
      }

      if (!availabilityMap[professionalId][dateKey]) {
        availabilityMap[professionalId][dateKey] = [];
      }

      availabilityMap[professionalId][dateKey].push(availability);
    }

    // Registro para controlar la ocupación de horarios
    const bookedSlots: Record<string, Record<string, Set<string>>> = {};

    // Función para marcar un slot como ocupado
    const markSlotAsBooked = (professionalId: string, patientId: string, date: Date): void => {
      const dateStr = date.toDateString();
      const timeStr = `${date.getHours()}:00`;

      // Inicializamos registros si no existen
      if (!bookedSlots[professionalId]) {
        bookedSlots[professionalId] = {};
      }

      if (!bookedSlots[professionalId][dateStr]) {
        bookedSlots[professionalId][dateStr] = new Set<string>();
      }

      // Marcamos el slot como ocupado
      bookedSlots[professionalId][dateStr].add(timeStr);

      // También registramos que el paciente está ocupado en ese horario
      if (!bookedSlots[patientId]) {
        bookedSlots[patientId] = {};
      }

      if (!bookedSlots[patientId][dateStr]) {
        bookedSlots[patientId][dateStr] = new Set<string>();
      }

      bookedSlots[patientId][dateStr].add(timeStr);
    };

    // Función para verificar si un slot está disponible
    const isSlotAvailable = (professionalId: string, patientId: string, date: Date): boolean => {
      const dateStr = date.toDateString();
      const timeStr = `${date.getHours()}:00`;

      // Verificamos disponibilidad del profesional
      if (
        bookedSlots[professionalId] &&
        bookedSlots[professionalId][dateStr] &&
        bookedSlots[professionalId][dateStr].has(timeStr)
      ) {
        return false;
      }

      // Verificamos disponibilidad del paciente
      if (
        bookedSlots[patientId] &&
        bookedSlots[patientId][dateStr] &&
        bookedSlots[patientId][dateStr].has(timeStr)
      ) {
        return false;
      }

      return true;
    };

    // Array para almacenar todas las citas
    const appointmentData: {
      id: string;
      patientId: string;
      professionalId: string;
      availabilityId: string;
      appointmentDate: Date;
      status: AppointmentStatus;
      createdAt: Date;
      updatedAt: Date;
    }[] = [];

    // UUIDs de los usuarios específicos
    const fixedProfessionals = [ANA_PROFESSIONAL_UUID, CARLOS_PROFESSIONAL_UUID];
    const fixedPatients = [ELENA_PATIENT_UUID, MIGUEL_PATIENT_UUID];

    // Función modificada para encontrar un slot disponible
    const findAvailableSlot = (
      professionalId: string,
      patientId: string,
      targetDate: Date,
      status: AppointmentStatus,
    ): { date: Date; availabilityId: string } | null => {
      const dateStr = targetDate.toDateString();

      // Verificamos si hay disponibilidades para esta fecha y profesional
      if (!availabilityMap[professionalId] || !availabilityMap[professionalId][dateStr]) {
        return null;
      }

      // Filtramos los slots que están disponibles
      const availableSlots = availabilityMap[professionalId][dateStr].filter((slot) => {
        const slotHour = slot.startTime.getHours();
        const slotDate = new Date(targetDate);
        slotDate.setHours(slotHour, 0, 0, 0);

        return isSlotAvailable(professionalId, patientId, slotDate);
      });

      if (availableSlots.length === 0) {
        return null;
      }

      // Seleccionamos un slot disponible
      // Para citas SCHEDULED, elegimos el primer slot disponible para asegurar consistencia
      // Para otros estados, podemos elegir aleatoriamente
      const selectedSlot =
        status === AppointmentStatus.SCHEDULED
          ? availableSlots[0]
          : availableSlots[Math.floor(Math.random() * availableSlots.length)];

      // Creamos la fecha para la cita
      const appointmentDate = new Date(targetDate);
      appointmentDate.setHours(selectedSlot.startTime.getHours(), 0, 0, 0);

      // Marcamos el slot como ocupado
      markSlotAsBooked(professionalId, patientId, appointmentDate);

      return {
        date: appointmentDate,
        availabilityId: selectedSlot.id,
      };
    };

    // Para cada combinación de paciente-profesional con UUIDs fijos:
    for (const patientId of fixedPatients) {
      for (const professionalId of fixedProfessionals) {
        spinner.update(
          `Generando citas para paciente ${patientId} con profesional ${professionalId}...`,
        );

        // 2 citas pasadas (COMPLETED) - Exactamente 2 como se requiere
        for (let i = 0; i < 2; i++) {
          const pastDate = createLocalDate(now);
          // Primera cita: 15 días atrás, segunda: 7 días atrás
          pastDate.setDate(now.getDate() - (i === 0 ? 15 : 7));
          pastDate.setHours(9 + i, 0, 0, 0);

          // Buscamos un slot disponible para esta fecha
          const slotInfo = findAvailableSlot(
            professionalId,
            patientId,
            pastDate,
            AppointmentStatus.COMPLETED,
          );

          if (slotInfo) {
            appointmentData.push({
              id: uuidv4(),
              patientId,
              professionalId,
              availabilityId: slotInfo.availabilityId,
              appointmentDate: slotInfo.date,
              status: AppointmentStatus.COMPLETED,
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        // 2 citas futuras (SCHEDULED) - Exactamente 2 como se requiere
        for (let i = 0; i < 2; i++) {
          // Primera cita: 7 días adelante, segunda: 14 días adelante
          const futureDate = createLocalDate(now);
          futureDate.setDate(now.getDate() + (i === 0 ? 7 : 14));
          futureDate.setHours(14 + i, 0, 0, 0);

          // Buscamos un slot disponible para esta fecha
          const slotInfo = findAvailableSlot(
            professionalId,
            patientId,
            futureDate,
            AppointmentStatus.SCHEDULED,
          );

          if (slotInfo) {
            appointmentData.push({
              id: uuidv4(),
              patientId,
              professionalId,
              availabilityId: slotInfo.availabilityId,
              appointmentDate: slotInfo.date,
              status: AppointmentStatus.SCHEDULED,
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        // 1 cita cancelada (CANCELLED) - Exactamente 1 como se requiere
        const cancelledDate = createLocalDate(now);
        cancelledDate.setDate(now.getDate() - 3);
        cancelledDate.setHours(11, 0, 0, 0);

        // Buscamos un slot disponible para esta fecha
        const slotInfo = findAvailableSlot(
          professionalId,
          patientId,
          cancelledDate,
          AppointmentStatus.CANCELLED,
        );

        if (slotInfo) {
          appointmentData.push({
            id: uuidv4(),
            patientId,
            professionalId,
            availabilityId: slotInfo.availabilityId,
            appointmentDate: slotInfo.date,
            status: AppointmentStatus.CANCELLED,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // Agregar algunas citas adicionales para otros pacientes/profesionales
    const regularProfessionals = professionals.filter(
      (p) => p.id !== ANA_PROFESSIONAL_UUID && p.id !== CARLOS_PROFESSIONAL_UUID,
    );

    const regularPatients = patients.filter(
      (p) => p.id !== ELENA_PATIENT_UUID && p.id !== MIGUEL_PATIENT_UUID,
    );

    // Fecha base para citas adicionales
    const tomorrow = createLocalDate(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const nextWeek = createLocalDate(now);
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const lastWeek = createLocalDate(now);
    lastWeek.setDate(now.getDate() - 7);
    lastWeek.setHours(11, 0, 0, 0);

    // Creamos algunas citas aleatorias para los demás pacientes/profesionales
    for (let i = 0; i < 10; i++) {
      const randomPatient = regularPatients[Math.floor(Math.random() * regularPatients.length)];
      const randomProfessional =
        regularProfessionals[Math.floor(Math.random() * regularProfessionals.length)];

      if (randomPatient && randomProfessional) {
        // Fecha aleatoria: pasada, futura o cancelada
        const randomType = Math.floor(Math.random() * 3);
        let baseDate: Date;
        let status: AppointmentStatus;

        switch (randomType) {
          case 0: // Pasada
            baseDate = createLocalDate(lastWeek);
            baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 10));
            status = AppointmentStatus.COMPLETED;
            break;
          case 1: // Futura
            baseDate = createLocalDate(nextWeek);
            baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 20));
            status = AppointmentStatus.SCHEDULED;
            break;
          case 2: // Cancelada
          default:
            baseDate = createLocalDate(lastWeek);
            baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 5));
            status = AppointmentStatus.CANCELLED;
            break;
        }

        baseDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

        // Intentamos encontrar un slot disponible existente
        const slotInfo = findAvailableSlot(
          randomProfessional.id,
          randomPatient.id,
          baseDate,
          status,
        );

        // Si encontramos disponibilidad, creamos la cita
        if (slotInfo) {
          appointmentData.push({
            id: uuidv4(),
            patientId: randomPatient.id,
            professionalId: randomProfessional.id,
            availabilityId: slotInfo.availabilityId,
            appointmentDate: slotInfo.date,
            status,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    spinner.update(`Insertando ${appointmentData.length} citas en la base de datos...`);

    // Actualizamos los slots de disponibilidad a "reservados" para los que se usaron
    for (const appointment of appointmentData) {
      const dateStr = appointment.appointmentDate.toDateString();

      // Buscamos slots que coincidan con la fecha y hora de la cita
      if (
        availabilityMap[appointment.professionalId] &&
        availabilityMap[appointment.professionalId][dateStr]
      ) {
        const matchingSlots = availabilityMap[appointment.professionalId][dateStr].filter(
          (slot) => slot.startTime.getHours() === appointment.appointmentDate.getHours(),
        );

        for (const slot of matchingSlots) {
          await prisma.availability.update({
            where: { id: slot.id },
            data: { isBooked: true },
          });
        }
      }
    }

    // Utilizamos una transacción para mejorar el rendimiento al insertar las citas
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
    // Definimos fecha para created_at
    const now = createLocalDate();

    const notificationData: {
      id: string;
      userId: string;
      appointmentId: string;
      type: NotificationType;
      isSent: boolean;
      sentAt: Date | null;
      createdAt: Date;
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
        sentAt: createLocalDate(
          new Date(createLocalDate().setHours(createLocalDate().getHours() - 24)),
        ),
        createdAt: now,
      });

      // Para el profesional
      notificationData.push({
        id: uuidv4(),
        userId: appointment.professionalId,
        appointmentId: appointment.id,
        type: NotificationType.CONFIRMATION,
        isSent: true,
        sentAt: createLocalDate(
          new Date(createLocalDate().setHours(createLocalDate().getHours() - 24)),
        ),
        createdAt: now,
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
          createdAt: now,
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
          sentAt: createLocalDate(
            new Date(createLocalDate().setHours(createLocalDate().getHours() - 12)),
          ),
          createdAt: now,
        });

        notificationData.push({
          id: uuidv4(),
          userId: appointment.professionalId,
          appointmentId: appointment.id,
          type: NotificationType.CANCELLATION,
          isSent: true,
          sentAt: createLocalDate(
            new Date(createLocalDate().setHours(createLocalDate().getHours() - 12)),
          ),
          createdAt: now,
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
    // Definimos fecha para created_at
    const now = createLocalDate();

    const auditLogData = [
      // Registro de inicio de sesión
      {
        id: uuidv4(),
        userId: users[0].id,
        action: 'LOGIN',
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          timestamp: createLocalDate().toISOString(),
        },
        createdAt: now,
      },
      // Registro de creación de cita
      {
        id: uuidv4(),
        userId: users[2].id,
        action: 'CREATE_APPOINTMENT',
        metadata: {
          patientId: users[2].id,
          professionalId: users[0].id,
          appointmentDate: createLocalDate(
            new Date(createLocalDate().setDate(createLocalDate().getDate() + 3)),
          ).toISOString(),
        },
        createdAt: now,
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
        createdAt: now,
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
        createdAt: now,
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
    // Definimos fecha para created_at y updated_at
    const now = createLocalDate();

    const configData = [
      {
        id: uuidv4(),
        key: 'NOTIFICATION_REMINDER_HOURS',
        value: '24',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        key: 'APPOINTMENT_CANCELLATION_LIMIT_HOURS',
        value: '6',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        key: 'DEFAULT_APPOINTMENT_DURATION_MINUTES',
        value: '60',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        key: 'SYSTEM_TIMEZONE',
        value: 'America/Bogota',
        createdAt: now,
        updatedAt: now,
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
