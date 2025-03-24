/**
 * Script para preparar la base de datos de prueba
 * Crea la base de datos postgres_test si no existe y ejecuta las migraciones
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import * as util from 'util';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = util.promisify(exec);

// Cargar variables de entorno desde .env.test si existe
const testEnvPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(testEnvPath)) {
  console.log('📝 Cargando variables de entorno desde .env.test');
  dotenv.config({ path: testEnvPath });
} else {
  // Cargar variables de entorno desde .env
  dotenv.config();
}

async function prepareTestDatabase() {
  console.log('🔧 Preparando base de datos de prueba...');

  // Establecer entorno de prueba
  process.env.NODE_ENV = 'test';

  // URL actual para conexión root
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) {
    throw new Error('Variable de entorno DATABASE_URL no definida');
  }

  // DIRECT_URL para operaciones directas sin pgBouncer
  const directUrl = process.env.DIRECT_URL || originalUrl;

  try {
    // Parsear la URL para obtener el host, puerto, etc.
    const url = new URL(directUrl);
    const parts = url.pathname.split('/');

    // Formar URL para conexión al servidor (sin base de datos específica)
    parts[1] = 'postgres'; // Conectar a la base de datos postgres por defecto
    url.pathname = parts.join('/');
    const serverUrl = url.toString();

    // Crear cliente para conexión administrativa
    const adminPrisma = new PrismaClient({
      datasources: {
        db: {
          url: serverUrl,
        },
      },
    });

    console.log('🔍 Verificando si existe la base de datos de prueba...');

    try {
      // Verificar si la base de datos de prueba ya existe
      const result = await adminPrisma.$queryRaw`
        SELECT 1 FROM pg_database WHERE datname = 'postgres_test'
      `;

      // Si la consulta no devuelve resultados, la base de datos no existe
      if (!Array.isArray(result) || result.length === 0) {
        console.log('🆕 Creando base de datos de prueba...');
        await adminPrisma.$executeRawUnsafe(`CREATE DATABASE postgres_test`);
      } else {
        console.log('✓ Base de datos de prueba ya existe');
      }
    } catch (error) {
      console.error('Error al verificar/crear la base de datos:', error);
      throw error;
    } finally {
      await adminPrisma.$disconnect();
    }

    // URL para la base de datos de prueba
    parts[1] = 'postgres_test';
    url.pathname = parts.join('/');
    const testDbUrl = url.toString();

    // Configurar variables de entorno para migraciones
    process.env.DATABASE_URL = testDbUrl;

    // Crear versión con pgBouncer para pruebas si era necesario
    if (originalUrl.includes('pgbouncer=true')) {
      const bouncerUrl = new URL(testDbUrl);
      bouncerUrl.searchParams.set('pgbouncer', 'true');
      bouncerUrl.searchParams.set('connection_limit', '1');
      process.env.DATABASE_URL = bouncerUrl.toString();
      process.env.DIRECT_URL = testDbUrl;
    }

    console.log('🔄 Ejecutando migraciones en la base de datos de prueba...');
    try {
      // Ejecutar migraciones con Prisma
      const { stdout, stderr } = await execPromise('npx prisma migrate deploy');
      console.log(stdout);
      if (stderr) console.error(stderr);

      console.log('✅ Base de datos de prueba preparada correctamente');

      // Intentar cargar datos de prueba
      console.log('🔄 Cargando datos iniciales de prueba...');
      try {
        // Usar import() dinámico para cargar el módulo seed-test
        const seedTestModule = await import('./seed-test');
        await seedTestModule.default();
        console.log('✅ Datos iniciales de prueba cargados correctamente');
      } catch (error) {
        console.error('⚠️ Error al cargar datos de prueba:', error);
        console.log('⚠️ Los tests deberán crear sus propios datos si es necesario.');
      }
    } catch (error) {
      console.error('Error al ejecutar las migraciones:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error al preparar la base de datos de prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la función
prepareTestDatabase();
