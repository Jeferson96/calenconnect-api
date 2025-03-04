import { Injectable, Logger } from '@nestjs/common';
import { AppConfig, Config, SupabaseConfig } from './interfaces';
import { YamlLoaderService } from './yaml-loader.service';

/**
 * Servicio para acceder a los valores de configuración de manera tipada
 */
@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private readonly config: Config;

  constructor(private readonly yamlLoaderService: YamlLoaderService) {
    this.config = this.yamlLoaderService.loadConfig();
    this.logger.log('Configuración cargada correctamente');
  }

  /**
   * Obtiene la configuración completa
   * @returns La configuración completa tipada
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Obtiene la configuración de la aplicación CalenConnect API
   * @returns La configuración de la aplicación
   */
  getAppConfig(): AppConfig {
    return this.config['calenconnect-api'];
  }

  /**
   * Obtiene la configuración de Supabase
   * @returns La configuración de conexión a Supabase
   */
  getSupabaseConfig(): SupabaseConfig {
    return this.config.supabase;
  }

  /**
   * Obtiene un valor específico de la configuración
   * @param key - La clave del valor a obtener
   * @returns El valor solicitado o undefined si no existe
   */
  get<T>(key: string): T | undefined {
    // Convertimos primero a unknown para evitar errores de TypeScript
    return this.getNestedConfig<T>(key, this.config as unknown as Record<string, unknown>);
  }

  /**
   * Obtiene un valor anidado de la configuración
   * @param path - La ruta del valor a obtener (separada por puntos)
   * @param config - El objeto de configuración
   * @returns El valor anidado o undefined si no existe
   */
  private getNestedConfig<T>(path: string, config: Record<string, unknown>): T | undefined {
    const keys = path.split('.');
    let current: unknown = config;

    for (const key of keys) {
      if (current === undefined || current === null) {
        this.logger.warn(`La clave de configuración "${path}" no existe`);
        return undefined;
      }

      if (typeof current !== 'object') {
        this.logger.warn(
          `No se puede acceder a la propiedad "${key}" en "${path}" porque no es un objeto`,
        );
        return undefined;
      }

      current = (current as Record<string, unknown>)[key];
    }

    return current as T;
  }
}
