# Módulo de Configuración para CalenConnect API

Este módulo proporciona un sistema centralizado para gestionar la configuración de la aplicación CalenConnect API.

## Características

- Carga de configuración desde archivos YAML
- Validación de configuración en tiempo de inicio
- Acceso tipado a valores de configuración
- Soporte para múltiples entornos (desarrollo, QA, producción)

## Uso

### Importar el módulo

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@libs/config';

@Module({
  imports: [ConfigModule],
  // ...
})
export class AppModule {}
```

### Acceder a la configuración en los servicios

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@libs/config';

@Injectable()
export class MiServicio {
  constructor(private readonly configService: ConfigService) {}

  async algúnMétodo() {
    // Obtener la configuración completa
    const config = this.configService.getConfig();

    // Obtener la configuración de la aplicación
    const appConfig = this.configService.getAppConfig();
    const puerto = appConfig.port;

    // Obtener la configuración de Supabase
    const supabaseConfig = this.configService.getSupabaseConfig();
    const url = supabaseConfig.url;
    
    // Obtener un valor específico usando notación de puntos
    const valor = this.configService.get<string>('supabase.url');
  }
}
```

## Estructura de archivos de configuración

Los archivos de configuración deben seguir la estructura definida en `example-config.yaml`:

```yaml
# Configuración de la aplicación CalenConnect API
calenconnect-api:
  port: 3000

# Configuración de conexión a Supabase
supabase:
  url: "https://your-supabase-url.supabase.co"
  key: "your-supabase-key"
```

## Entornos

El módulo busca automáticamente el archivo de configuración adecuado según el entorno:

- `development`: Entorno de desarrollo local
- `qa`: Entorno de pruebas y control de calidad
- `production`: Entorno de producción

Para especificar el entorno, establezca la variable de entorno `NODE_ENV` al iniciar la aplicación.

## Añadir nuevas secciones de configuración

1. Cree una nueva interfaz en `libs/config/src/interfaces/`
2. Actualice la interfaz `Config` en `libs/config/src/interfaces/config.interface.ts`
3. Actualice el método de validación en `YamlLoaderService` si es necesario 