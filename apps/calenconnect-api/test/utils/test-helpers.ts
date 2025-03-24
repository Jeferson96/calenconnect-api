import { PrismaService } from '@libs/database';

/**
 * Limpia todas las tablas de la base de datos utilizando un enfoque que desactiva
 * temporalmente las restricciones de clave foránea para permitir la limpieza completa
 */
export async function cleanDatabaseSafely(prisma: PrismaService): Promise<void> {
  try {
    // Desactiva las restricciones de clave foránea temporalmente
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    // Obtenemos información sobre las tablas que existen
    const tables = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `;

    console.log('Tablas existentes:', tables);

    // Limpia cada tabla en el orden adecuado para respetar las dependencias
    // La tabla _prisma_migrations no debe limpiarse, es interna de Prisma

    // Primero las tablas que dependen de otras
    await prisma.appointment.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.auditLog.deleteMany({});

    // Luego las tablas base
    await prisma.user.deleteMany({});
    await prisma.configuration.deleteMany({});

    // Verificamos que las tablas estén vacías
    const userCount = await prisma.user.count();
    const availabilityCount = await prisma.availability.count();
    const appointmentCount = await prisma.appointment.count();

    console.log('Verificación tras limpieza:', {
      userCount,
      availabilityCount,
      appointmentCount,
    });

    // Reactiva las restricciones de clave foránea
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    console.log('Base de datos limpiada correctamente');
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
    throw error;
  }
}
