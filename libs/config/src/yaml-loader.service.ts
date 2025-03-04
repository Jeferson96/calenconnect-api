import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { Environment } from './constants/environments.enum';
import { Config } from './interfaces/config.interface';

/**
 * Servicio para cargar y validar archivos de configuración YAML
 */
@Injectable()
export class YamlLoaderService {
  private readonly logger = new Logger(YamlLoaderService.name);
  private readonly YAML_CONFIG_FILENAME = 'config.yaml';

  /**
   * Carga un archivo YAML de configuración
   * @returns La configuración tipada
   */
  loadConfig(): Config {
    try {
      const env = (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT;
      const filePath = join(this.getConfigPath(env), this.YAML_CONFIG_FILENAME);

      this.logger.log(`Cargando configuración desde: ${filePath}`);

      const fileContents = readFileSync(filePath, 'utf8');
      const config = yaml.load(fileContents) as Config;

      this.validateConfig(config);

      return config;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al cargar la configuración: ${errorMessage}`);
      throw new Error(`Error al cargar la configuración: ${errorMessage}`);
    }
  }

  /**
   * Obtiene la ruta del archivo de configuración según el entorno
   * @param env El entorno actual
   * @returns La ruta relativa al archivo de configuración
   */
  private getConfigPath(env: Environment): string {
    switch (env) {
      case Environment.DEVELOPMENT:
        return process.cwd();
      case Environment.QA:
      case Environment.PRODUCTION:
        return process.cwd();
      default:
        this.logger.warn(`Entorno desconocido: ${String(env)}, usando configuración de desarrollo`);
        return process.cwd();
    }
  }

  /**
   * Valida que la configuración contenga todas las secciones requeridas
   * @param config La configuración cargada
   */
  private validateConfig(config: Config): void {
    if (!config['calenconnect-api']) {
      throw new Error('La configuración no contiene la sección calenconnect-api');
    }

    if (!config.supabase) {
      throw new Error('La configuración no contiene la sección supabase');
    }
  }
}
