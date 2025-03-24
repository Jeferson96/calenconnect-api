# Estrategia de Pruebas para CalenConnect API

Este documento describe la estrategia de pruebas implementada para CalenConnect API, incluyendo los diferentes tipos de pruebas, la configuración, y las mejores prácticas.

## Tipos de Pruebas

### 1. Pruebas Unitarias

Las pruebas unitarias verifican componentes individuales de forma aislada.

**Ubicación:** `__tests__/unit/**/*.spec.ts`

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

**Ubicación:** `__tests__/integration/**/*.spec.ts`

**Ejemplo:**
```typescript
// prisma-user.repository.spec.ts
describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
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

Las pruebas E2E verifican el sistema completo desde la interfaz de usuario hasta la base de datos.

**Ubicación:** `test/e2e/**/*.e2e-spec.ts`

**Ejemplo:**
```typescript
// user.e2e-spec.ts
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testUser: User;
  
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

Para las pruebas utilizamos una base de datos separada `postgres_test` que:
1. Se crea automáticamente si no existe
2. Se migra con el esquema actualizado
3. Se carga con datos de prueba básicos

### Variables de Entorno

El archivo `.env.test` contiene configuraciones específicas para pruebas:
- URLs de conexión a la base de datos de prueba
- Credenciales y configuraciones específicas

## Estructura de Directorios

```
proyecto/
├── __tests__/
│   ├── unit/            # Pruebas unitarias
│   └── integration/     # Pruebas de integración
├── test/
│   └── e2e/             # Pruebas end-to-end
├── jest.config.js       # Configuración de Jest
├── jest.setup.js        # Configuración global para pruebas
└── prisma/
    ├── prepare-test-db.ts  # Script para preparar DB de prueba
    └── seed-test.ts        # Datos iniciales para prueba
```

## Mejores Prácticas

1. **Independencia de pruebas**: Cada prueba debe poder ejecutarse de forma independiente.
2. **Datos aislados**: Crear datos específicos para cada prueba en lugar de depender de datos preexistentes.
3. **Limpieza**: Limpiar los datos creados después de cada prueba para evitar interferencias.
4. **Mocking adecuado**: En pruebas unitarias, usar mocks para servicios externos y dependencias.
5. **Validación de errores**: Verificar tanto casos exitosos como casos de error.

## Comandos

- `npm test`: Ejecuta todas las pruebas
- `npm run test:unit`: Ejecuta solo pruebas unitarias
- `npm run test:integration`: Ejecuta solo pruebas de integración
- `npm run test:e2e`: Ejecuta solo pruebas end-to-end
- `npm run db:test:prepare`: Prepara la base de datos de prueba

## Resolución de Problemas Comunes

### Timeouts en Pruebas E2E
Si las pruebas E2E fallan por timeout, puedes incrementar el tiempo límite en `beforeAll` y `afterAll`:

```typescript
beforeAll(async () => {
  // configuración
}, 30000); // 30 segundos
```

### Errores de Conexión a Base de Datos
Verifica que las credenciales en `.env.test` sean correctas y que la base de datos exista. 