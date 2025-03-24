import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';
import path from 'path';
import { defineConfig } from '@jest/types';

/**
 * Entorno personalizado para pruebas con Prisma
 * Crea una base de datos temporal para cada ejecución de pruebas
 */
class PrismaTestEnvironment {
  private readonly dbName: string;
  private readonly originalUrl: string;
  private readonly prismaClient: PrismaClient;

  constructor() {
    this.dbName = `test_${uuidv4().replace(/-/g, '_')}`;
    this.originalUrl = process.env.DATABASE_URL || '';
    this.prismaClient = new PrismaClient();
  }

  /**
   * Configura el entorno antes de las pruebas
   */
  async setup(): Promise<void> {
    // Guardar la URL original y crear una URL para la base de datos de prueba
    const url = new URL(this.originalUrl);
    url.pathname = `/${this.dbName}`;

    // Establecer la nueva URL para que Prisma la use
    process.env.DATABASE_URL = url.toString();

    try {
      // Crear una base de datos temporal
      await this.prismaClient.$executeRawUnsafe(`CREATE DATABASE "${this.dbName}" WITH OWNER = postgres ENCODING = 'UTF8'`);

      // Ejecutar migraciones en la base de datos de prueba con timeout aumentado
      execSync('npx prisma migrate deploy', {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
        },
        timeout: 60000 // Aumentar el timeout a 60 segundos
      });
      
      // Limpiar la base de datos después de las migraciones para asegurar un estado limpio
      await this.cleanDatabase();
      
      console.log('✅ Entorno de prueba configurado correctamente');
    } catch (error) {
      console.error('❌ Error al configurar la base de datos de prueba:', error);
      throw error;
    }
  }

  /**
   * Limpia el entorno después de las pruebas
   */
  async teardown(): Promise<void> {
    try {
      // Limpiar la base de datos antes de eliminarla
      await this.cleanDatabase();
      
      // Cerrar conexiones
      await this.prismaClient.$disconnect();

      // Eliminar la base de datos temporal
      const otherClient = new PrismaClient({
        datasources: {
          db: {
            url: this.originalUrl,
          },
        },
      });

      await otherClient.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${this.dbName}" WITH (FORCE)`);
      await otherClient.$disconnect();

      // Restaurar la URL original
      process.env.DATABASE_URL = this.originalUrl;
      
      console.log('✅ Entorno de prueba limpiado correctamente');
    } catch (error) {
      console.error('❌ Error al limpiar el entorno de prueba:', error);
    }
  }

  /**
   * Limpia la base de datos para tener un estado predecible
   */
  private async cleanDatabase(): Promise<void> {
    try {
      console.log('🧹 Limpiando base de datos del entorno de prueba...');
      
      // Desactivar temporalmente las restricciones de clave foránea
      await this.prismaClient.$executeRawUnsafe('SET session_replication_role = replica;');
      
      // Obtener todas las tablas excepto _prisma_migrations
      const tablenames = await this.prismaClient.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;
      
      // Truncar todas las tablas
      for (const { tablename } of tablenames) {
        try {
          await this.prismaClient.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
          console.log(`✓ Tabla ${tablename} limpiada`);
        } catch (err) {
          console.warn(`⚠️ Error al truncar tabla ${tablename}:`, err);
        }
      }
      
      // Reactivar las restricciones de clave foránea
      await this.prismaClient.$executeRawUnsafe('SET session_replication_role = default;');
      
      console.log('✅ Base de datos limpiada para el entorno de prueba');
    } catch (error) {
      console.error('❌ Error al limpiar la base de datos del entorno:', error);
    }
  }

  /**
   * Crea una instancia limpia del cliente de Prisma
   */
  getPrismaClient(): PrismaClient {
    // Siempre crear una nueva instancia para evitar problemas de caché
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configurar log para depuración durante pruebas
      log: ['warn', 'error'],
    });
  }
}

// Para usar con Jest setup global
export default PrismaTestEnvironment;
