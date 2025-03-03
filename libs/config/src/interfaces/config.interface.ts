import { AppConfig } from './app-config.interface';
import { SupabaseConfig } from './supabase-config.interface';

/**
 * Interfaz global que define la estructura completa del archivo de configuración
 */
export interface Config {
  /** Configuración de la aplicación CalenConnect API */
  'calenconnect-api': AppConfig;

  /** Configuración de conexión a Supabase */
  supabase: SupabaseConfig;
}
