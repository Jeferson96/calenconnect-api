# Módulo Común para CalenConnect API

Este módulo proporciona componentes reutilizables para mejorar la seguridad y el manejo de errores en la aplicación.

## Componentes Incluidos

### Guardias

- **AuthGuard**: Verifica la autenticación de usuarios mediante tokens JWT
- **RolesGuard**: Controla el acceso a recursos basado en roles de usuario

### Filtros

- **HttpExceptionFilter**: Estandariza las respuestas de error en la aplicación

### Interceptores

- **ResponseTransformInterceptor**: Formatea todas las respuestas exitosas en un formato estándar

### Decoradores

- **Roles**: Permite asignar roles requeridos para acceder a un endpoint

## Roles del Sistema

Los roles definidos en el sistema son:

- **PATIENT**: Usuario que puede gestionar únicamente sus propias citas
- **PROFESSIONAL**: Usuario que puede gestionar su disponibilidad y las citas que le han sido asignadas
- **ADMIN**: (Futuro) Usuario con acceso a funcionalidades de auditoría y configuración global

## Uso

### Guardias

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard, Roles, UserRole } from '@libs/common';

@Controller('citas')
@UseGuards(AuthGuard, RolesGuard)
export class CitasController {
  @Get('todas')
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  getCitas() {
    return { citas: [...] };
  }
  
  @Get('mis-citas')
  @Roles(UserRole.PATIENT, UserRole.PROFESSIONAL)
  getMisCitas() {
    return { misCitas: [...] };
  }
}
```

### Filtros e Interceptores Globales

Para aplicar filtros e interceptores a toda la aplicación, regístralos en el archivo main.ts:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter, ResponseTransformInterceptor } from '@libs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aplicar filtros e interceptores globalmente
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  
  await app.listen(3000);
}
bootstrap();
```

## Extensión

Para añadir nuevos componentes:

1. Crear el componente en el directorio correspondiente
2. Exportarlo en el archivo index.ts del directorio
3. Registrarlo en el CommonModule si es necesario 