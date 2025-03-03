**Épica: Configuración del Proyecto Backend**

-   📍 Objetivo: Crear la base del backend, establecer la arquitectura y definir endpoints esenciales.
-   📌 Historias de usuario y tickets a definir:
    -   Inicialización del backend con **NestJS**.
    -   Configuración de **Prisma ORM** para conexión con PostgreSQL.
    -   Definición de **estructura de carpetas** siguiendo Clean Architecture.
    -   Creación de **endpoints base** para autenticación y manejo de datos iniciales.
    -   Implementación de **Swagger** para documentación de la API.

---
## Historias de usuario
---
### **Historia de Usuario 1: Inicialización del Proyecto Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero inicializar el proyecto backend con NestJS para establecer la base del sistema.

**Descripción:**  
Se debe inicializar el backend con **NestJS**, asegurando que la estructura del proyecto siga los principios de **Clean Architecture, Hexagonal Architecture y DDD**, permitiendo una organización modular y escalable.

**Criterios de Aceptación:**  
✅ Se inicializa el proyecto backend con **NestJS y TypeScript**.  
✅ Se configura **Eslint y Prettier** para mantener estándares de código.  
✅ Se define una estructura modular alineada con **DDD y Clean Architecture**.  
✅ Se crea una **configuración base de dependencias** (ejemplo: configuración de env variables, scripts de ejecución).  
✅ Se documenta la configuración inicial en el repositorio.

**Prioridad:** Alta  
**Dependencias:** Ninguna (es el primer paso del backend).

----------

### **Historia de Usuario 2: Configuración de la Base de Datos con Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero configurar la base de datos con Supabase PostgreSQL para garantizar una gestión escalable y segura de los datos.

**Descripción:**  
Se debe establecer la conexión con **Supabase PostgreSQL**, asegurando compatibilidad con el ORM y alineación con **Clean Architecture y DDD**. También se debe configurar la seguridad de acceso a la base de datos utilizando **Row Level Security (RLS)**.

**Criterios de Aceptación:**  
✅ Se configura **Supabase PostgreSQL** como base de datos del backend.  
✅ Se establece la conexión con **Prisma ORM**, asegurando compatibilidad con Supabase.  
✅ Se implementa **Row Level Security (RLS)** para controlar acceso a los datos según roles.  
✅ Se configuran **variables de entorno seguras** para conexión con la base de datos.  
✅ Se documenta la configuración de la base de datos y su integración con Prisma en el repositorio.

**Prioridad:** Alta  
**Dependencias:** Inicialización del proyecto backend.

----------
### **Historia de Usuario 3: Definición de la Estructura de Carpetas y Organización del Código en el Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero definir la estructura de carpetas y la organización del código en el backend para asegurar modularidad y escalabilidad.

**Descripción:**  
Se debe establecer una estructura de carpetas alineada con **Clean Architecture, Hexagonal Architecture y DDD**, asegurando una separación clara entre las capas de dominio, aplicación, infraestructura y presentación.

**Criterios de Aceptación:**  
✅ Se define una estructura modular que refleje la funcionalidad principal del sistema (**Screaming Architecture**).  
✅ Se separan las capas de **dominio, aplicación, infraestructura y presentación**.  
✅ Se implementa una carpeta dedicada para **entidades, repositorios, servicios y controladores**.  
✅ Se documenta la estructura de carpetas y su alineación con los principios arquitectónicos en el repositorio.  
✅ Se verifica que la organización permite escalar y mantener el proyecto de manera eficiente.

**Prioridad:** Alta  
**Dependencias:** Inicialización del proyecto backend, Configuración de la base de datos y ORM.

----------

### **Historia de Usuario 4: Configuración de Controladores, Servicios y Repositorios Base**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero configurar la capa de controladores, servicios y repositorios en el backend para garantizar una estructura modular y escalable.

**Descripción:**  
Se debe establecer la arquitectura base de **Controladores (Controllers), Servicios (Services) y Repositorios (Repositories)** siguiendo los principios de **DDD, Clean Architecture y Hexagonal Architecture**. Esto asegurará una correcta separación de responsabilidades y facilitará la escalabilidad del sistema.

**Criterios de Aceptación:**  
✅ Se implementa un **controlador base** que gestione peticiones HTTP.  
✅ Se configura una capa de **servicios** que maneje la lógica de negocio.  
✅ Se implementa una capa de **repositorios** que gestione la interacción con la base de datos mediante Prisma.  
✅ Se establece la inyección de dependencias para desacoplar módulos y facilitar pruebas unitarias.  
✅ Se documenta la arquitectura y cómo deben crearse nuevos módulos siguiendo esta estructura.

**Prioridad:** Alta  
**Dependencias:** Definición de la estructura de carpetas y organización del código en el backend.

----------

### **Historia de Usuario 5: Configuración del Sistema de Autenticación con Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero configurar el sistema de autenticación utilizando Supabase Auth para gestionar el acceso seguro de los usuarios.

**Descripción:**  
Se debe implementar **Supabase Auth** como el sistema de autenticación del backend, asegurando que el manejo de sesiones y validación de usuarios cumpla con **los principios de seguridad y regulación de datos**. Se debe establecer una estrategia de gestión de **roles y permisos** basada en **Row Level Security (RLS)**.

**Criterios de Aceptación:**  
✅ Se configura **Supabase Auth** como el proveedor de autenticación del backend.  
✅ Se establecen **roles y permisos** diferenciados para pacientes y profesionales.  
✅ Se implementa la validación de **tokens JWT** emitidos por Supabase.  
✅ Se configuran **rutas protegidas** en el backend que solo acepten tokens válidos.  
✅ Se documenta el flujo de autenticación y cómo interactúa con el frontend.

**Prioridad:** Alta  
**Dependencias:** Configuración de la base de datos con Supabase.

----------

### **Historia de Usuario 6: Configuración de la Gestión de Roles y Permisos con Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero configurar la gestión de roles y permisos en Supabase para controlar el acceso a los datos según el tipo de usuario.

**Descripción:**  
Se debe implementar un esquema de **roles y permisos** en Supabase utilizando **Row Level Security (RLS)** para diferenciar entre **pacientes y profesionales**. Además, se debe definir una estrategia para que el backend pueda validar y aplicar estos permisos correctamente en las consultas a la base de datos.

**Criterios de Aceptación:**  
✅ Se configuran los roles de **paciente y profesional** en Supabase.  
✅ Se implementan **políticas de acceso** con **Row Level Security (RLS)** para garantizar que cada usuario solo pueda acceder a sus propios datos.  
✅ Se asegura que el backend valide los permisos de los usuarios antes de ejecutar operaciones en la base de datos.  
✅ Se documenta la estrategia de roles y cómo se aplican en Supabase.

**Prioridad:** Alta  
**Dependencias:** Configuración del sistema de autenticación con Supabase.

----------
### **Historia de Usuario 7: Configuración de la Comunicación entre el Backend y Supabase**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero configurar la comunicación entre el backend y Supabase para garantizar la correcta interacción con la base de datos y autenticación.

**Descripción:**  
Se debe establecer una integración eficiente entre el backend y Supabase para manejar peticiones a la base de datos y validar autenticaciones. Es fundamental garantizar que todas las consultas y operaciones cumplan con los **principios de seguridad y escalabilidad** definidos.

**Criterios de Aceptación:**  
✅ Se implementa una **capa de abstracción** para manejar la comunicación con Supabase.  
✅ Se configuran métodos en el backend para interactuar con **Supabase Auth y la base de datos**.  
✅ Se establece una estrategia de **validación de tokens JWT** en cada solicitud al backend.  
✅ Se documenta la configuración y el flujo de comunicación con Supabase.

**Prioridad:** Alta  
**Dependencias:** Configuración de la base de datos y autenticación con Supabase.

----------

### **Historia de Usuario 8: Configuración de Seguridad y Protección de Datos en el Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero configurar medidas de seguridad en el backend para garantizar la protección de datos sensibles y el cumplimiento normativo.

**Descripción:**  
Se deben implementar medidas de seguridad en el backend para proteger la información de los usuarios, asegurando el cumplimiento de normativas como la **Ley 1581 de 2012 (Protección de Datos en Colombia)** y **GDPR** en caso de usuarios internacionales.

**Criterios de Aceptación:**  
✅ Se implementa **cifrado en reposo** para datos sensibles almacenados en Supabase.  
✅ Se configura **TLS/HTTPS** para el cifrado en tránsito en todas las comunicaciones.  
✅ Se aseguran **prácticas de almacenamiento seguro de tokens JWT**, evitando exposición de credenciales.  
✅ Se establecen políticas de **retención y eliminación de datos**, alineadas con regulaciones de privacidad.  
✅ Se documentan las medidas de seguridad implementadas en el repositorio.

**Prioridad:** Alta  
**Dependencias:** Configuración de la comunicación entre el backend y Supabase.

----------

### **Historia de Usuario 9: Configuración del Sistema de Logs y Monitoreo en el Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero configurar un sistema de logs y monitoreo en el backend para detectar errores y mejorar la estabilidad del sistema.

**Descripción:**  
Se debe establecer un mecanismo de **registro de eventos y monitoreo de actividad** en el backend para garantizar una gestión efectiva de errores y la supervisión del rendimiento del sistema.

**Criterios de Aceptación:**  
✅ Se implementa un **sistema de logs estructurados** para registrar eventos importantes (errores, autenticaciones, accesos a la base de datos).  
✅ Se configura un **servicio de monitoreo** para capturar métricas de rendimiento y disponibilidad.  
✅ Se asegura que los registros sean almacenados de manera segura y accesibles para auditoría.  
✅ Se documenta la configuración del sistema de logs y monitoreo en el repositorio.

**Prioridad:** Media  
**Dependencias:** Configuración de seguridad y protección de datos en el backend.

----------

### **Historia de Usuario 10: Configuración de la Documentación Técnica del Backend**

📌 **Épica:** Configuración del Proyecto Backend

**Título:** Como desarrollador, quiero establecer una documentación técnica clara del backend para facilitar su mantenimiento y escalabilidad.

**Descripción:**  
Se debe documentar la configuración del backend, incluyendo su arquitectura, integración con Supabase y estrategias de seguridad. Esto garantizará que el equipo de desarrollo pueda comprender el diseño del sistema y realizar futuras mejoras sin afectar la estabilidad.

**Criterios de Aceptación:**  
✅ Se documenta la **arquitectura del backend**, incluyendo la separación de capas y patrones utilizados.  
✅ Se detallan las **integraciones con Supabase**, tanto en autenticación como en base de datos.  
✅ Se documentan las **convenciones de código y buenas prácticas** utilizadas en el backend.  
✅ Se crea una guía de instalación y despliegue para nuevos desarrolladores.  
✅ Se almacena la documentación en el repositorio (`README.md`, Wiki interna o Notion).

**Prioridad:** Media  
**Dependencias:** Configuración del sistema de logs y monitoreo en el backend.

----------
