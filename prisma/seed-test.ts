import {
  PrismaClient,
  UserRole,
  AppointmentStatus,
  Prisma,
  User,
  Availability,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Script para cargar datos de prueba en la base de datos de test
 * Versión simplificada del seed.ts principal
 */

// Constantes para IDs fijos que se pueden usar en pruebas (ahora usando UUIDs válidos)
export const TEST_IDS = {
  PROFESSIONAL: {
    FIRST: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // UUID v4 válido
    SECOND: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', // UUID v4 válido
  },
  PATIENT: {
    FIRST: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', // UUID v4 válido
    SECOND: 'f47ac10b-58cc-4372-a567-0e02b2c3d482', // UUID v4 válido
  },
  AVAILABILITY: {
    FIRST: 'f47ac10b-58cc-4372-a567-0e02b2c3d483', // UUID v4 válido
    SECOND: 'f47ac10b-58cc-4372-a567-0e02b2c3d484', // UUID v4 válido
  },
  APPOINTMENT: {
    CONFIRMED: 'f47ac10b-58cc-4372-a567-0e02b2c3d485', // UUID v4 válido
    CANCELLED: 'f47ac10b-58cc-4372-a567-0e02b2c3d486', // UUID v4 válido
  },
};

const prisma = new PrismaClient();

/**
 * Función principal para sembrar datos de prueba
 */
async function main() {
  console.log('🌱 Iniciando carga de datos de prueba...');

  // Limpiamos datos existentes directamente
  await cleanDatabase(prisma);

  // Creamos usuarios de prueba
  const { professionals, patients } = await seedUsers(prisma);

  // Creamos disponibilidades para los profesionales
  const availabilities = await seedAvailability(prisma, professionals);

  // Creamos algunas citas
  await seedAppointments(prisma, professionals, patients, availabilities);

  console.log('✅ Datos de prueba cargados correctamente');
}

/**
 * Limpia la base de datos
 */
async function cleanDatabase(tx: PrismaClient) {
  // Importante: eliminar datos en orden correcto respetando las restricciones de claves foráneas
  await tx.notification.deleteMany({});
  await tx.appointment.deleteMany({});
  await tx.auditLog.deleteMany({});
  await tx.availability.deleteMany({});
  await tx.user.deleteMany({});
  await tx.configuration?.deleteMany({});
  console.log('🧹 Base de datos limpiada');
}

/**
 * Crea usuarios de prueba (profesionales y pacientes)
 */
async function seedUsers(tx: PrismaClient): Promise<{ professionals: User[]; patients: User[] }> {
  const now = new Date();

  // Datos de profesionales de prueba
  const professionalData = [
    {
      id: TEST_IDS.PROFESSIONAL.FIRST,
      authUserId: uuidv4(),
      firstName: 'Doctor',
      lastName: 'Prueba',
      role: UserRole.PROFESSIONAL,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: TEST_IDS.PROFESSIONAL.SECOND,
      authUserId: uuidv4(),
      firstName: 'Doctora',
      lastName: 'Test',
      role: UserRole.PROFESSIONAL,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Datos de pacientes de prueba
  const patientData = [
    {
      id: TEST_IDS.PATIENT.FIRST,
      authUserId: uuidv4(),
      firstName: 'Paciente',
      lastName: 'Uno',
      role: UserRole.PATIENT,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: TEST_IDS.PATIENT.SECOND,
      authUserId: uuidv4(),
      firstName: 'Paciente',
      lastName: 'Dos',
      role: UserRole.PATIENT,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // En lugar de usar createMany, creamos cada usuario individualmente
  // con verificación previa para evitar errores de ID duplicado
  const professionals: User[] = [];
  const patients: User[] = [];

  // Crear profesionales
  for (const profData of professionalData) {
    try {
      // Verificar si ya existe un usuario con este ID
      const existingUser = await tx.user.findUnique({
        where: { id: profData.id },
      });

      if (!existingUser) {
        // Crear el usuario solo si no existe
        const prof = await tx.user.create({
          data: profData,
        });
        professionals.push(prof);
      } else {
        // Si ya existe, usarlo tal cual
        professionals.push(existingUser);
      }
    } catch (error) {
      console.error(`Error al crear profesional ${profData.id}:`, error);
    }
  }

  // Crear pacientes
  for (const patData of patientData) {
    try {
      // Verificar si ya existe un usuario con este ID
      const existingUser = await tx.user.findUnique({
        where: { id: patData.id },
      });

      if (!existingUser) {
        // Crear el usuario solo si no existe
        const pat = await tx.user.create({
          data: patData,
        });
        patients.push(pat);
      } else {
        // Si ya existe, usarlo tal cual
        patients.push(existingUser);
      }
    } catch (error) {
      console.error(`Error al crear paciente ${patData.id}:`, error);
    }
  }

  console.log(
    `👥 Creados/utilizados ${professionals.length} profesionales y ${patients.length} pacientes`,
  );

  return { professionals, patients };
}

/**
 * Crea disponibilidades para los profesionales
 */
async function seedAvailability(tx: PrismaClient, professionals: User[]): Promise<Availability[]> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0); // 8:00 AM

  const availabilityData: Prisma.AvailabilityCreateInput[] = [];

  // Para el primer profesional creamos con ID fijo
  if (professionals.length > 0) {
    availabilityData.push({
      id: TEST_IDS.AVAILABILITY.FIRST,
      professional: {
        connect: { id: professionals[0].id },
      },
      availableDate: tomorrow,
      startTime: new Date(tomorrow.getTime() + 9 * 3600000), // 9:00 AM
      endTime: new Date(tomorrow.getTime() + 10 * 3600000), // 10:00 AM
      createdAt: now,
      updatedAt: now,
    });

    // Otra disponibilidad para el primer profesional
    availabilityData.push({
      id: TEST_IDS.AVAILABILITY.SECOND,
      professional: {
        connect: { id: professionals[0].id },
      },
      availableDate: tomorrow,
      startTime: new Date(tomorrow.getTime() + 14 * 3600000), // 2:00 PM
      endTime: new Date(tomorrow.getTime() + 15 * 3600000), // 3:00 PM
      createdAt: now,
      updatedAt: now,
    });
  }

  // Para el segundo profesional
  if (professionals.length > 1) {
    availabilityData.push({
      id: uuidv4(),
      professional: {
        connect: { id: professionals[1].id },
      },
      availableDate: tomorrow,
      startTime: new Date(tomorrow.getTime() + 11 * 3600000), // 11:00 AM
      endTime: new Date(tomorrow.getTime() + 12 * 3600000), // 12:00 PM
      createdAt: now,
      updatedAt: now,
    });
  }

  // Insertamos todas las disponibilidades una por una
  const availabilities: Availability[] = [];
  for (const data of availabilityData) {
    const availability = await tx.availability.create({
      data,
    });
    availabilities.push(availability);
  }

  console.log(`📅 Creadas ${availabilities.length} disponibilidades`);

  return availabilities;
}

/**
 * Crea citas entre pacientes y profesionales
 */
async function seedAppointments(
  tx: PrismaClient,
  professionals: User[],
  patients: User[],
  availabilities: Availability[],
): Promise<void> {
  const now = new Date();

  if (professionals.length > 0 && patients.length > 0 && availabilities.length > 0) {
    // Cita confirmada para pruebas
    const confirmedAppointment: Prisma.AppointmentCreateInput = {
      id: TEST_IDS.APPOINTMENT.CONFIRMED,
      patient: {
        connect: { id: patients[0].id },
      },
      professional: {
        connect: { id: professionals[0].id },
      },
      availability: {
        connect: { id: availabilities[0].id },
      },
      appointmentDate: availabilities[0].startTime,
      status: AppointmentStatus.SCHEDULED,
      createdAt: now,
      updatedAt: now,
    };

    // Cita cancelada para pruebas
    const cancelledAppointment: Prisma.AppointmentCreateInput = {
      id: TEST_IDS.APPOINTMENT.CANCELLED,
      patient: {
        connect: { id: patients.length > 1 ? patients[1].id : patients[0].id },
      },
      professional: {
        connect: { id: professionals[0].id },
      },
      availability: {
        connect: { id: availabilities.length > 1 ? availabilities[1].id : availabilities[0].id },
      },
      appointmentDate:
        availabilities.length > 1 ? availabilities[1].startTime : availabilities[0].startTime,
      status: AppointmentStatus.CANCELLED,
      createdAt: now,
      updatedAt: now,
    };

    // Insertamos las citas una por una
    await tx.appointment.create({
      data: confirmedAppointment,
    });

    await tx.appointment.create({
      data: cancelledAppointment,
    });

    console.log(`📝 Creadas 2 citas (1 confirmada, 1 cancelada)`);
  } else {
    console.log('⚠️ No se pudieron crear citas por falta de datos');
  }
}

// Ejecutamos la función principal
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Para poder importar en otros archivos
export default main;
