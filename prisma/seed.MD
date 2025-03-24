# Documentación del Archivo de Semilla (seed.ts)

## 🌱 Visión General

Este archivo proporciona los datos iniciales para la base de datos del proyecto CalenConnect, creando entidades interrelacionadas que permiten probar la aplicación con datos realistas.

## 📋 Estructura y Flujo de Ejecución

El script sigue un orden lógico basado en las dependencias entre entidades:

1. **Limpieza de datos existentes**
2. **Creación de usuarios** (profesionales y pacientes)
3. **Generación de disponibilidad** para profesionales
4. **Programación de citas** entre pacientes y profesionales
5. **Creación de notificaciones** asociadas a citas
6. **Generación de registros de auditoría**
7. **Configuración del sistema**

## 👥 Entidades Principales

### Usuarios (`seedUsers`)
- **Profesionales**: Incluye 2 profesionales con UUIDs fijos (Ana y Carlos) y otros generados dinámicamente.
- **Pacientes**: Incluye 2 pacientes con UUIDs fijos (Elena y Miguel) y otros generados dinámicamente.
- **Correos Electrónicos**: 
  - Ana: `xodedak293@amgens.com`
  - Carlos: `kilomi8050@avulos.com` 
  - Elena: `cadaj82929@amgens.com`
  - Miguel: `rofijo8238@amgens.com`

### Disponibilidad (`seedAvailability`)
- Bloques horarios de **1 hora** (8:00-9:00, 9:00-10:00, etc.)
- Último bloque del día de **2 horas** (18:00-20:00)
- Disponibilidad especial para profesionales con UUID fijo para garantizar espacios para citas pasadas, futuras y canceladas.

### Citas (`seedAppointments`)
- Siempre duran **1 hora**
- Para pacientes con UUID fijo:
  - 2 citas **completadas** (pasadas)
  - 2 citas **programadas** (futuras)
  - 1 cita **cancelada**
- Las citas solo se asignan en **espacios disponibles ya registrados**
- Sistema de prevención de **solapamientos** tanto para profesionales como para pacientes

### Notificaciones (`seedNotifications`)
- Tipos: confirmación, recordatorio y cancelación
- Enviadas a ambos participantes (profesional y paciente)

### Registros de Auditoría (`seedAuditLogs`)
- Acciones: inicio de sesión, creación de cita, cancelación y actualización de perfil

### Configuración (`seedConfiguration`)
- Valores por defecto para recordatorios, límites de cancelación y duración de citas

## 🔧 Funciones Auxiliares

### `createLocalDate`
Crea fechas ajustadas a la zona horaria local (América/Bogota).

### `createAvailabilitySlot`
Helper para crear slots de disponibilidad con formato consistente.

### `findAvailableSlot`
Busca un slot disponible en el mapa de disponibilidades existentes.

### `isSlotAvailable`
Verifica que un horario no tenga conflictos por solapamiento.

### `markSlotAsBooked`
Registra un slot como ocupado para evitar futuros solapamientos.

## ⚠️ Restricciones Importantes

1. **Duración de citas**: Siempre 1 hora exacta
2. **Estructura de disponibilidad**:
   - Bloques horarios de 1 hora
   - Último bloque del día obligatoriamente de 2 horas
3. **Asignación de citas para pacientes con UUID fijo**:
   - Solo en espacios ya parametrizados como disponibles
   - Sin solapamientos entre citas

## 🔄 Flujo de Asignación de Citas

1. Obtener todas las disponibilidades existentes
2. Mapear disponibilidades por profesional y fecha
3. Para cada combinación de paciente-profesional con UUID fijo:
   - Buscar slots para las citas pasadas, futuras y canceladas
   - Verificar disponibilidad y ausencia de conflictos
   - Marcar slots como ocupados al asignar citas
4. Actualizar el estado de los slots de disponibilidad utilizados

## 📊 Resultado

El script genera un conjunto coherente de datos que permite probar todas las funcionalidades del sistema, manteniendo la integridad de las relaciones y respetando las reglas de negocio.

## 🚀 Uso

El script se ejecuta automáticamente cuando se invoca mediante:
```bash
npm run seed
```

Al finalizar, muestra información detallada sobre el número de entidades creadas y el tiempo de ejecución.
