<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## 📌 Descripción del Proyecto

CalenConnect API es una aplicación backend robusta desarrollada con NestJS que proporciona servicios para la gestión de calendarios, disponibilidad y citas. El sistema permite a los usuarios gestionar sus horarios, definir periodos de disponibilidad y programar citas de manera eficiente.

La API está construida siguiendo principios de Arquitectura Limpia y Domain-Driven Design (DDD), lo que garantiza un código mantenible, escalable y enfocado en el dominio del negocio.

## 🎯 Objetivo y Alcance

### Objetivo General

Proporcionar una plataforma robusta para la gestión de calendarios y citas, facilitando la coordinación entre personas que necesitan programar reuniones o servicios basados en la disponibilidad mutua.

### Objetivos Específicos

- Permitir a los usuarios gestionar sus perfiles y preferencias de calendario
- Facilitar la definición de períodos de disponibilidad
- Permitir la creación, modificación y cancelación de citas
- Proporcionar una API bien documentada y segura para integraciones con aplicaciones cliente
- Implementar un sistema escalable siguiendo buenas prácticas de arquitectura

### Público Objetivo

- Profesionales independientes que necesitan gestionar su agenda
- Empresas de servicios que requieren un sistema de citas
- Desarrolladores que buscan integrar funcionalidades de calendario en sus aplicaciones

## 📂 Estructura del Proyecto

```
calenconnect-api/
├── apps/
│   └── calenconnect-api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── user/              # Gestión de usuarios
│       │   │   ├── availability/      # Gestión de disponibilidad
│       │   │   └── appointment/       # Gestión de citas
│       │   ├── swagger/               # Configuración de documentación API
│       │   ├── app.module.ts          # Módulo principal de la aplicación
│       │   └── main.ts                # Punto de entrada de la aplicación
│       └── test/                      # Pruebas de integración
├── libs/
│   ├── common/                        # Utilidades y componentes comunes
│   ├── config/                        # Configuración de la aplicación
│   ├── database/                      # Acceso a base de datos
│   ├── domain/                        # Definiciones de dominio compartidas
│   └── infrastructure/                # Componentes de infraestructura compartidos
├── prisma/                            # Esquema y configuración de Prisma ORM
└── config/                            # Archivos de configuración global
```

### Arquitectura

El proyecto implementa una **Arquitectura Limpia** combinada con principios de **Domain-Driven Design (DDD)** con un enfoque modular:

- **Capa de Dominio**: Entidades, objetos de valor, excepciones y eventos que representan los conceptos centrales del negocio.
- **Capa de Aplicación**: Casos de uso (servicios) que orquestan la lógica de negocio.
- **Capa de Infraestructura**: Implementaciones técnicas como controladores REST, repositorios y DTOs.

### Principales Módulos

1. **Módulo de Usuario**
   - Gestión de perfiles de usuario
   - Autenticación y autorización

2. **Módulo de Disponibilidad**
   - Definición de períodos de disponibilidad
   - Gestión de horarios recurrentes

3. **Módulo de Citas**
   - Creación y gestión de citas
   - Confirmación y cancelación

## ⚙️ Requisitos Previos

Para ejecutar este proyecto, necesitarás tener instalado:

- Node.js (v18 o superior)
- npm (v8 o superior)
- PostgreSQL (opcional si utilizas Supabase)
- Cuenta en Supabase (para autenticación y base de datos)

## 🚀 Instrucciones de Instalación y Ejecución

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/calenconnect-api.git
   cd calenconnect-api
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus propias credenciales.

4. Ejecuta las migraciones de la base de datos:
   ```bash
   npx prisma migrate dev
   ```

5. (Opcional) Carga datos semilla:
   ```bash
   npm run seed
   ```

### Colección de Postman y Variables de Entorno

Para facilitar el desarrollo y pruebas de la API, se proporciona una colección de Postman que incluye todos los endpoints disponibles y ejemplos de uso.

1. Importa la colección de Postman:
   - Abre Postman
   - Importa el archivo `CalenConnect.postman_collection.json` ubicado en la raíz del proyecto
   - Importa el archivo de variables de entorno `CalenConnect.postman_environment.json`

2. Configura las variables de entorno en Postman:
   - Selecciona el ambiente "CalenConnect Local"
   - Verifica que las siguientes variables estén configuradas:
     - `baseUrl`: URL base de la API (por defecto: http://localhost:3000/api)
     - `authToken`: Token de autenticación (se actualiza automáticamente al iniciar sesión)

3. Variables de entorno locales:
   El proyecto incluye un archivo `.env.example` con todas las variables necesarias:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/calenconnect"
   
   # JWT
   JWT_SECRET="your-secret-key"
   JWT_EXPIRATION="1d"
   
   # Server
   PORT=3000
   NODE_ENV="development"
   ```

### Ejecución

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:3000/api`
La documentación Swagger estará disponible en: `http://localhost:3000/api/docs`

## 🔧 Uso y Ejemplos

### Flujos Principales

#### Creación de Usuario

```mermaid
sequenceDiagram
    participant Cliente
    participant UserController
    participant UserService
    participant UserRepository
    participant Database
    
    Cliente->>UserController: POST /api/users
    UserController->>UserService: createUser(dto)
    UserService->>UserRepository: save(userEntity)
    UserRepository->>Database: insert query
    Database-->>UserRepository: user record
    UserRepository-->>UserService: user entity
    UserService-->>UserController: user response
    UserController-->>Cliente: user created
```

#### Definición de Disponibilidad

```mermaid
sequenceDiagram
    participant Cliente
    participant AvailabilityController
    participant AvailabilityService
    participant AvailabilityRepository
    participant Database
    
    Cliente->>AvailabilityController: POST /api/availability
    AvailabilityController->>AvailabilityService: createAvailability(dto)
    AvailabilityService->>AvailabilityRepository: validateUserExists (user repo)
    AvailabilityService->>AvailabilityRepository: save(availabilityEntity)
    AvailabilityRepository->>Database: insert query
    Database-->>AvailabilityRepository: availability record
    AvailabilityRepository-->>AvailabilityService: availability entity
    AvailabilityService-->>AvailabilityController: availability response
    AvailabilityController-->>Cliente: availability created
```

### Ejemplos de Uso de la API

#### Crear un nuevo usuario

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

#### Definir disponibilidad

```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user-id",
    "startDate": "2023-06-01T09:00:00Z",
    "endDate": "2023-06-01T17:00:00Z"
  }'
```

#### Programar una cita

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Reunión de proyecto",
    "hostId": "host-user-id",
    "guestId": "guest-user-id",
    "startDate": "2023-06-01T10:00:00Z",
    "endDate": "2023-06-01T11:00:00Z"
  }'
```

## 🧪 Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas end-to-end
npm run test:e2e

# Ver cobertura de pruebas
npm run test:cov
```

## 🛠 Guía de Contribución

Agradecemos todas las contribuciones al proyecto. Si deseas contribuir, por favor sigue estas pautas:

1. **Crea un fork** del repositorio
2. **Crea una rama** para tu funcionalidad (`git checkout -b feature/amazing-feature`)
3. **Realiza tus cambios** siguiendo las convenciones de código
4. **Asegúrate de incluir pruebas** para tu funcionalidad
5. **Envía un pull request** a la rama principal

### Convenciones de Código

- Utiliza la guía de estilo de TypeScript proporcionada (configurada en ESLint y Prettier)
- Escribe pruebas unitarias para toda la funcionalidad
- Sigue los principios de arquitectura limpia y DDD
- Usa nombres descriptivos para variables, funciones y clases

### Convenciones de Commits

Todos los commits deben seguir las mejores prácticas de Conventional Commits:

```
<tipo>(<ámbito opcional>): <descripción>

[Descripción extendida opcional]

[Referencias opcionales a issues o tickets]
```

Ejemplos de tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de errores
- `docs`: Cambios en la documentación
- `style`: Cambios de formato sin lógica
- `refactor`: Reestructuración de código sin cambios funcionales
- `test`: Adición o modificación de pruebas
- `chore`: Tareas de mantenimiento (configuración, dependencias, etc.)


## 🙋‍♂️ Soporte

Si necesitas ayuda o tienes preguntas sobre el proyecto:
- Abre un issue en el repositorio
- Contacta al equipo de desarrollo en [email@example.com]

---

Desarrollado con ❤️ usando [NestJS](https://nestjs.com/)
