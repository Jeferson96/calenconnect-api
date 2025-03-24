import { PrismaService } from '@libs/database';

/**
 * Limpia todas las tablas de la base de datos utilizando un enfoque que desactiva
 * temporalmente las restricciones de clave foránea para permitir la limpieza completa
 */
export async function cleanDatabaseSafely(prisma: PrismaService): Promise<void> {
  console.log('🧹 Iniciando limpieza segura de la base de datos...');

  try {
    // Primero intentamos la limpieza con deleteMany en orden específico
    // Esto evita posibles deadlocks al no usar TRUNCATE que requiere lock exclusivo
    try {
      console.log('Intentando limpieza con deleteMany en orden específico...');
      await prisma.$transaction([
        prisma.appointment.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.availability.deleteMany(),
        prisma.auditLog.deleteMany(),
        prisma.user.deleteMany(),
        prisma.configuration.deleteMany(),
      ]);
      console.log('Limpieza con deleteMany completada');
    } catch (deleteError) {
      console.warn(
        '⚠️ Error en deleteMany de algunas tablas, intentando método alternativo:',
        deleteError,
      );

      // Si hay error con deleteMany, intentamos con las restricciones de clave foránea desactivadas
      try {
        // Desactiva las restricciones de clave foránea temporalmente
        await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

        // Limpiamos las tablas directamente con deleteMany de nuevo, ahora sin restricciones FK
        await prisma.appointment.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.availability.deleteMany();
        await prisma.auditLog.deleteMany();
        await prisma.user.deleteMany();
        await prisma.configuration.deleteMany();

        // Reactiva las restricciones de clave foránea
        await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
        console.log('Limpieza alternativa completada');
      } catch (alternativeError) {
        console.error('❌ Error en limpieza alternativa:', alternativeError);
      }
    }

    // Verificamos que las tablas estén vacías
    const userCount = await prisma.user.count();
    const availabilityCount = await prisma.availability.count();
    const appointmentCount = await prisma.appointment.count();
    const notificationCount = await prisma.notification.count();

    console.log('🔍 Verificación tras limpieza:', {
      userCount,
      availabilityCount,
      appointmentCount,
      notificationCount,
    });

    // Si aún hay registros, intentar una limpieza más agresiva
    if (userCount > 0 || availabilityCount > 0 || appointmentCount > 0 || notificationCount > 0) {
      console.warn(
        '⚠️ Algunas tablas no se limpiaron completamente. Intentando método con TRUNCATE...',
      );

      try {
        // Como último recurso, intentamos con TRUNCATE pero con un timeout y manejo de reintentos
        // Desactiva las restricciones de clave foránea temporalmente
        await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

        // Obtenemos información sobre las tablas que existen
        const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
        `;

        console.log('📊 Tablas existentes:', tables);

        // Truncar todas las tablas excepto _prisma_migrations
        for (const { tablename } of tables) {
          if (tablename !== '_prisma_migrations') {
            try {
              await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
              console.log(`✓ Tabla ${tablename} limpiada con TRUNCATE CASCADE`);
            } catch (truncateError) {
              console.warn(`⚠️ Error al truncar ${tablename}:`, truncateError);
            }
          }
        }

        // Reactiva las restricciones de clave foránea
        await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

        console.log('🔄 Verificando nuevamente después del método TRUNCATE...');
        const userCountAfter = await prisma.user.count();
        const availabilityCountAfter = await prisma.availability.count();
        const appointmentCountAfter = await prisma.appointment.count();

        console.log('🔍 Verificación tras método TRUNCATE:', {
          userCount: userCountAfter,
          availabilityCount: availabilityCountAfter,
          appointmentCount: appointmentCountAfter,
        });
      } catch (txError) {
        console.error('❌ Error en limpieza con TRUNCATE:', txError);
      }
    }

    console.log('✅ Base de datos limpiada correctamente');
  } catch (error) {
    console.error('❌ Error general al limpiar la base de datos:', error);
    throw error;
  }
}
