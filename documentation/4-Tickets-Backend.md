## **📌 Tickets Backend**


### **📌 Ticket 1: Inicialización del Proyecto Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Inicializar el proyecto backend con NestJS y TypeScript

**Descripción:**  
Se debe crear la base del proyecto backend utilizando **NestJS con TypeScript**, asegurando que la arquitectura siga los principios de **Clean Architecture, Hexagonal Architecture y DDD**, permitiendo modularidad y escalabilidad.

**Tareas:**

-   Crear el proyecto con **NestJS y TypeScript** mediante `npx nest new backend`.
-   Configurar **Eslint y Prettier** para mantener estándares de código.
-   Definir una **estructura inicial de carpetas** basada en principios arquitectónicos.
-   Verificar que el entorno de desarrollo y producción funcionan correctamente.
-   Agregar documentación en el repositorio (`README.md`) con instrucciones de instalación y ejecución.

**Criterios de Aceptación:**  
✅ El proyecto se crea correctamente con **NestJS y TypeScript**.  
✅ Eslint y Prettier están configurados y aplicados en el código.  
✅ La estructura de carpetas refleja una organización modular.  
✅ La aplicación se ejecuta sin errores en **modo desarrollo y producción**.  
✅ La documentación está disponible en el repositorio.

**Prioridad:** Alta  
**Dependencias:** Ninguna (es el primer paso del backend).

----------

### **📌 Ticket 2: Configuración de la Base de Datos con Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Configurar Supabase PostgreSQL como base de datos del backend

**Descripción:**  
Se debe establecer la conexión con **Supabase PostgreSQL**, asegurando compatibilidad con el ORM y alineación con **Clean Architecture y DDD**. También se debe configurar la seguridad de acceso a la base de datos utilizando **Row Level Security (RLS)** para gestionar permisos de usuarios.

**Tareas:**

-   Configurar **Supabase PostgreSQL** como la base de datos del backend.
-   Establecer la conexión con **Prisma ORM**, asegurando compatibilidad con Supabase.
-   Implementar **Row Level Security (RLS)** para restringir acceso a los datos según roles.
-   Configurar **variables de entorno seguras** para la conexión con la base de datos.
-   Documentar la configuración de la base de datos y su integración con Prisma en el repositorio.

**Criterios de Aceptación:**  
✅ Supabase PostgreSQL está correctamente configurado como la base de datos del backend.  
✅ Prisma ORM está integrado y conectado con Supabase.  
✅ Row Level Security (RLS) está implementado y funcional para restringir accesos.  
✅ La documentación de configuración y conexión está disponible en el repositorio.

**Prioridad:** Alta  
**Dependencias:** Inicialización del Proyecto Backend.

----------

### **📌 Ticket 3: Definición de la Estructura de Carpetas y Organización del Código en el Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Definir la estructura de carpetas y organización del código en el backend

**Descripción:**  
Se debe establecer una **estructura modular y escalable** en el backend siguiendo **Clean Architecture, Hexagonal Architecture y DDD**, asegurando una separación clara entre las capas de dominio, aplicación, infraestructura y presentación.

**Tareas:**

-   Definir y crear las **carpetas principales** del backend (`src/domain`, `src/application`, `src/infrastructure`, `src/presentation`).
-   Separar las capas de **dominio (entidades), aplicación (casos de uso), infraestructura (repositorios, conexión a BD) y presentación (controladores y rutas)**.
-   Implementar una carpeta dedicada para **configuración global** (variables de entorno, seguridad).
-   Asegurar que la estructura permite la **escalabilidad y mantenibilidad** del proyecto.
-   Documentar la estructura de carpetas y principios de organización en el repositorio.

**Criterios de Aceptación:**  
✅ La estructura de carpetas sigue los principios de **Clean Architecture y DDD**.  
✅ Se han separado correctamente las capas de dominio, aplicación, infraestructura y presentación.  
✅ Existe una documentación clara en el repositorio sobre la organización del código.

**Prioridad:** Alta  
**Dependencias:** Configuración de la Base de Datos con Supabase.

----------

### **📌 Ticket 4: Configuración de Controladores, Servicios y Repositorios Base**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Configurar la arquitectura base de controladores, servicios y repositorios en el backend

**Descripción:**  
Se debe establecer la arquitectura base en el backend implementando las capas de **controladores (controllers), servicios (services) y repositorios (repositories)**, siguiendo **Clean Architecture, Hexagonal Architecture y DDD**. Esto garantizará una correcta separación de responsabilidades y escalabilidad del sistema.

**Tareas:**

-   Crear una **estructura de controladores**, asegurando que manejen la comunicación con el frontend.
-   Implementar una **capa de servicios** para encapsular la lógica de negocio.
-   Configurar una **capa de repositorios** que gestione la interacción con la base de datos a través de Prisma.
-   Integrar **inyección de dependencias** para desacoplar módulos y facilitar pruebas unitarias.
-   Documentar la arquitectura y la forma en que deben crearse nuevos módulos en el repositorio.

**Criterios de Aceptación:**  
✅ Los controladores están implementados y manejan las peticiones HTTP correctamente.  
✅ La lógica de negocio está encapsulada en los servicios.  
✅ La interacción con la base de datos se realiza a través de la capa de repositorios.  
✅ Se han aplicado correctamente los principios de **inyección de dependencias**.  
✅ Existe una documentación clara en el repositorio sobre la estructura del backend.

**Prioridad:** Alta  
**Dependencias:** Definición de la Estructura de Carpetas y Organización del Código en el Backend.

----------

### **📌 Ticket 5: Configuración del Sistema de Autenticación con Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Configurar el sistema de autenticación en el backend utilizando Supabase Auth

**Descripción:**  
Se debe establecer la autenticación de usuarios en el backend utilizando **Supabase Auth**, asegurando que la validación de credenciales y la gestión de sesiones sean seguras y escalables.

**Tareas:**

-   Integrar **Supabase Auth** en el backend para la autenticación de usuarios.
-   Configurar el flujo de **inicio de sesión, registro y cierre de sesión**.
-   Implementar validación de **tokens JWT** emitidos por Supabase.
-   Proteger rutas privadas asegurando que solo los usuarios autenticados puedan acceder.
-   Documentar la configuración del sistema de autenticación en el repositorio.

**Criterios de Aceptación:**  
✅ Supabase Auth está configurado y funcionando correctamente en el backend.  
✅ Los usuarios pueden autenticarse utilizando el flujo de login y logout de Supabase.  
✅ Las rutas protegidas solo permiten el acceso a usuarios autenticados con tokens JWT válidos.  
✅ Existe una documentación clara en el repositorio sobre el sistema de autenticación.

**Prioridad:** Alta  
**Dependencias:** Configuración de Controladores, Servicios y Repositorios Base.

----------

### **📌 Ticket 6: Configuración de la Gestión de Roles y Permisos con Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Configurar la gestión de roles y permisos en Supabase para restringir el acceso a los datos según el tipo de usuario

**Descripción:**  
Se debe implementar un sistema de **roles y permisos** en Supabase utilizando **Row Level Security (RLS)** para garantizar que los pacientes y profesionales solo puedan acceder a los datos que les corresponden.

**Tareas:**

-   Configurar **roles de usuario** en Supabase (paciente y profesional).
-   Implementar políticas de acceso con **Row Level Security (RLS)** para restringir la consulta y modificación de datos.
-   Asegurar que el backend valide los permisos de los usuarios antes de ejecutar operaciones en la base de datos.
-   Crear pruebas para validar que los permisos funcionan correctamente.
-   Documentar la estrategia de gestión de roles y permisos en el repositorio.

**Criterios de Aceptación:**  
✅ Los roles de usuario están correctamente configurados en Supabase.  
✅ Row Level Security (RLS) restringe el acceso a los datos según el rol del usuario.  
✅ El backend valida los permisos antes de ejecutar cualquier operación sobre la base de datos.  
✅ Existe una documentación clara en el repositorio sobre la gestión de roles y permisos.

**Prioridad:** Alta  
**Dependencias:** Configuración del Sistema de Autenticación con Supabase.

----------

### **📌 Ticket 7: Configuración de la Comunicación entre el Backend y Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Establecer la comunicación entre el backend y Supabase para la gestión de autenticación y base de datos

**Descripción:**  
Se debe configurar una integración eficiente entre el backend y Supabase para manejar la autenticación de usuarios y las operaciones sobre la base de datos de manera segura y estructurada.

**Tareas:**

-   Implementar una **capa de abstracción** en el backend para interactuar con Supabase.
-   Configurar métodos para **autenticación, validación de tokens y recuperación de usuarios**.
-   Establecer un sistema de **consultas seguras** a la base de datos mediante Prisma y Supabase.
-   Implementar un mecanismo de **manejo de errores y reintentos** para solicitudes fallidas.
-   Documentar la estrategia de comunicación con Supabase en el repositorio.

**Criterios de Aceptación:**  
✅ La comunicación entre el backend y Supabase está correctamente establecida.  
✅ Los métodos de autenticación y validación de tokens funcionan sin errores.  
✅ La interacción con la base de datos es segura y estructurada.  
✅ Existe documentación clara en el repositorio sobre la comunicación con Supabase.

**Prioridad:** Alta  
**Dependencias:** Configuración de la Gestión de Roles y Permisos con Supabase.

----------

### **📌 Ticket 8: Configuración de Seguridad y Protección de Datos en el Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Implementar medidas de seguridad en el backend para proteger los datos sensibles y garantizar el cumplimiento normativo

**Descripción:**  
Se deben establecer e implementar medidas de **seguridad y protección de datos** en el backend, asegurando el cumplimiento de regulaciones como la **Ley 1581 de 2012 (Protección de Datos en Colombia)** y **GDPR** en caso de usuarios internacionales.

**Tareas:**

-   Configurar **cifrado en reposo** para datos sensibles en la base de datos de Supabase.
-   Implementar **TLS/HTTPS** para garantizar el cifrado en tránsito en todas las comunicaciones.
-   Aplicar mejores prácticas para el **almacenamiento seguro de tokens JWT**.
-   Establecer **políticas de retención y eliminación de datos**, alineadas con regulaciones de privacidad.
-   Documentar todas las medidas de seguridad implementadas en el repositorio.

**Criterios de Aceptación:**  
✅ Los datos sensibles almacenados en Supabase están cifrados correctamente.  
✅ Todas las comunicaciones entre el frontend, backend y Supabase utilizan **TLS/HTTPS**.  
✅ Se han aplicado medidas para evitar la exposición de tokens JWT en el backend.  
✅ Existe documentación clara en el repositorio sobre la seguridad y protección de datos en el backend.

**Prioridad:** Alta  
**Dependencias:** Configuración de la Comunicación entre el Backend y Supabase.

----------

### **📌 Ticket 9: Configuración del Sistema de Logs y Monitoreo en el Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Implementar un sistema de logs y monitoreo para detectar errores y optimizar el rendimiento del backend

**Descripción:**  
Se debe establecer un **sistema de registro de eventos y monitoreo** en el backend para garantizar una gestión efectiva de errores, auditoría de acciones y supervisión del rendimiento del sistema.

**Tareas:**

-   Implementar un **sistema de logs estructurados** para registrar eventos importantes (errores, autenticaciones, accesos a la base de datos).
-   Configurar un **servicio de monitoreo** para capturar métricas de rendimiento y disponibilidad.
-   Asegurar que los registros sean **almacenados de manera segura** y accesibles para auditoría.
-   Definir alertas automáticas para errores críticos o eventos anómalos en el backend.
-   Documentar la estrategia de logs y monitoreo en el repositorio.

**Criterios de Aceptación:**  
✅ El sistema de logs registra eventos críticos del backend de manera estructurada.  
✅ Se han configurado métricas de monitoreo del sistema.  
✅ Se han definido alertas automáticas para errores o comportamientos inesperados.  
✅ Existe documentación clara en el repositorio sobre el sistema de logs y monitoreo.

**Prioridad:** Media  
**Dependencias:** Configuración de Seguridad y Protección de Datos en el Backend.

----------

### **📌 Ticket 10: Configuración de la Documentación Técnica del Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Crear la documentación técnica del backend para facilitar su mantenimiento y escalabilidad

**Descripción:**  
Se debe documentar la **arquitectura del backend**, las convenciones de código y las integraciones clave, asegurando que el equipo de desarrollo tenga una referencia clara sobre el sistema.

**Tareas:**

-   Documentar la **estructura del backend**, incluyendo la separación de capas y patrones utilizados.
-   Definir y documentar **convenciones de código y buenas prácticas**.
-   Crear una guía de **instalación y configuración del entorno de desarrollo**.
-   Documentar la integración del backend con **Supabase (autenticación y base de datos)**.
-   Almacenar la documentación en el repositorio (`README.md`, Wiki interna o Notion).

**Criterios de Aceptación:**  
✅ Existe un documento detallado sobre la **arquitectura del backend**.  
✅ Se han definido y documentado las **convenciones de código** para el equipo de desarrollo.  
✅ La documentación incluye una **guía de instalación y configuración** del proyecto.  
✅ Se han documentado las integraciones clave, incluyendo la comunicación con **Supabase y el frontend**.  
✅ La documentación está accesible en el repositorio para consulta del equipo.

**Prioridad:** Media  
**Dependencias:** Configuración del Sistema de Logs y Monitoreo en el Backend.

----------

