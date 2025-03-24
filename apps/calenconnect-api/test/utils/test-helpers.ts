import { PrismaService } from '@libs/database';

/**
 * Limpia todas las tablas de la base de datos en el orden correcto
 * respetando las restricciones de clave foránea
 */
export async function cleanDatabaseSafely(prisma: PrismaService): Promise<void> {
  try {
    // Orden de eliminación respetando las restricciones de clave foránea
    // 1. Primero las tablas que dependen de otras (tienen claves foráneas)
    await prisma.notification.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.availability.deleteMany({});
    // 2. Finalmente las tablas principales
    await prisma.user.deleteMany({});
    await prisma.configuration?.deleteMany({});
    
    console.log('Base de datos limpiada correctamente');
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
    throw error;
  }
} 