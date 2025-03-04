import { AppConfig } from './app-config.interface';
import { SupabaseConfig } from './supabase-config.interface';
import { DatabaseConfig } from './database-config.interface';

/**
 * Interfaz que define la estructura global de la configuración
 */
export interface Config {
  /**
   * Configuración de la aplicación
   */
  app: AppConfig;

  /**
   * Configuración de Supabase
   */
  supabase: SupabaseConfig;

  /**
   * Configuración de la base de datos
   */
  database: DatabaseConfig;
}
