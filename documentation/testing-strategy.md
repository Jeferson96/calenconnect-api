# Estrategia de Pruebas para CalenConnect API

Este documento describe la estrategia de pruebas implementada para CalenConnect API, incluyendo los diferentes tipos de pruebas, la configuración, y las mejores prácticas.

## Tipos de Pruebas

### 1. Pruebas Unitarias

Las pruebas unitarias verifican componentes individuales de forma aislada.

**Ubicación:** `apps/calenconnect-api/src/**/*.spec.ts`

**Ejemplo:**
```typescript
// user.entity.spec.ts
describe('User Entity', () => {
  it('should create a valid user entity', () => {
    const user = new UserEntity({
      id: 'valid-uuid',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PATIENT
    });
    
    expect(user.id).toBe('valid-uuid');
    expect(user.fullName).toBe('John Doe');
  });
});
```

### 2. Pruebas de Integración

Las pruebas de integración verifican la interacción entre múltiples componentes o módulos.

**Ubicación:** `apps/calenconnect-api/src/**/*.integration.spec.ts`

**Ejemplo:**
```typescript
// user.repository.integration.spec.ts
describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;
  
  beforeEach(async () => {
    // Configuración con módulo de prueba
  });
  
  it('should create a new user', async () => {
    const user = await repository.create({
      firstName: 'Jane',
      lastName: 'Doe',
      role: UserRole.PATIENT
    });
    
    expect(user.id).toBeDefined();
    expect(user.firstName).toBe('Jane');
  });
});
```

### 3. Pruebas End-to-End (E2E)

Las pruebas E2E verifican el sistema completo desde la interfaz HTTP hasta la base de datos.

**Ubicación:** `apps/calenconnect-api/test/e2e/**/*.e2e-spec.ts`

**Ejemplo:**
```typescript
// user.e2e-spec.ts
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testDataFactory: TestDataFactory;
  
  beforeAll(async () => {
    // Configuración de la aplicación y creación de datos de prueba
  });
  
  it('should return user data for existing user', () => {
    return request(app.getHttpServer())
      .get(`/users/${testUser.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(testUser.id);
      });
  });
});
```

## Configuración del Entorno de Pruebas

### Jest

La configuración de Jest está en `jest.config.js` y define tres proyectos:
- `unit`: para pruebas unitarias
- `integration`: para pruebas de integración
- `e2e`: para pruebas end-to-end

### Base de Datos de Pruebas

Para las pruebas utilizamos una base de datos separada definida en `.env.test` que:
1. Se crea automáticamente si no existe
2. Se migra con el esquema actualizado
3. Se limpia entre pruebas mediante utilidades personalizadas

### Utilidades de Prueba

El proyecto incluye varias utilidades específicas para pruebas:

**Ubicación:** `apps/calenconnect-api/test/utils/`

- **test-helpers.ts**: Funciones para limpiar la base de datos y otras operaciones comunes
- **test-data-factory.ts**: Fábrica para crear datos de prueba consistentes
- **prisma-test-environment.ts**: Configuración de entorno Prisma para pruebas
- **test-data-helpers.ts**: Funciones auxiliares para manipular datos de prueba

## Estructura de Directorios

```
proyecto/
├── apps/
│   └── calenconnect-api/
│       ├── src/                # Código fuente y pruebas unitarias
│       └── test/               # Pruebas e2e y utilidades
│           ├── e2e/            # Pruebas end-to-end
│           │   ├── user/       # Pruebas e2e por módulo
│           │   ├── appointment/
│           │   └── availability/
│           └── utils/          # Utilidades compartidas para pruebas
├── jest.config.js              # Configuración de Jest
├── jest.setup.js               # Configuración global para pruebas
└── .env.test                   # Variables de entorno para pruebas
```

## Módulos con Pruebas End-to-End Implementadas

El proyecto tiene pruebas e2e implementadas para los siguientes módulos:

1. **Usuarios**: Gestión de usuarios, registro y datos de perfil
2. **Disponibilidad**: Creación y gestión de slots de disponibilidad para profesionales
3. **Citas**: Proceso completo de reserva, actualización y cancelación de citas

## Mejores Prácticas

1. **Independencia de pruebas**: Cada prueba puede ejecutarse de forma independiente mediante la limpieza segura de la base de datos.
2. **Datos aislados**: Se utiliza `TestDataFactory` para crear datos específicos para cada prueba.
3. **Limpieza**: La función `cleanDatabaseSafely` garantiza que no haya interferencia entre pruebas.
4. **Entorno aislado**: Uso de base de datos dedicada para pruebas para evitar afectar datos de desarrollo.
5. **Verificación completa**: Las pruebas e2e validan tanto casos exitosos como casos de error.

## Comandos

- `npm test`: Ejecuta todas las pruebas
- `npm run test:unit`: Ejecuta solo pruebas unitarias
- `npm run test:integration`: Ejecuta solo pruebas de integración
- `npm run test:e2e`: Ejecuta solo pruebas end-to-end

## Resolución de Problemas Comunes

### Timeouts en Pruebas E2E
Las pruebas E2E tienen configurado un timeout extendido en `jest.config.js` para manejar operaciones lentas de base de datos:

```javascript
testTimeout: 60000, // 60 segundos
```

### Errores de Conexión a Base de Datos
Verifica que las credenciales en `.env.test` sean correctas y que la base de datos exista. El sistema intentará limpiar la base de datos de múltiples formas si es necesario.

### Fallos por Datos Residuales
Si las pruebas fallan por datos residuales, puedes ejecutar la limpieza manual de la base de datos antes de iniciar las pruebas:

```typescript
import { PrismaService } from '@libs/database';
import { cleanDatabaseSafely } from '../utils/test-helpers';

// En beforeAll o beforeEach
await cleanDatabaseSafely(prismaService);
``` 