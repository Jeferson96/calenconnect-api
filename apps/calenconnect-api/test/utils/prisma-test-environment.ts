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
      await this.prismaClient.$executeRawUnsafe(`CREATE DATABASE "${this.dbName}"`);
      
      // Ejecutar migraciones en la base de datos de prueba
      execSync('npx prisma migrate deploy', {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
        },
      });
    } catch (error) {
      console.error('Error al configurar la base de datos de prueba:', error);
      throw error;
    }
  }

  /**
   * Limpia el entorno después de las pruebas
   */
  async teardown(): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error al limpiar la base de datos de prueba:', error);
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
    });
  }
}

// Para usar con Jest setup global
export default PrismaTestEnvironment; 