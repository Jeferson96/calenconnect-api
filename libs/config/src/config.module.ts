import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { YamlLoaderService } from './yaml-loader.service';

/**
 * Módulo de configuración personalizado que proporciona acceso a
 * los valores de configuración de la aplicación a través de archivos YAML.
 *
 * Este módulo es global para que pueda ser accedido desde cualquier
 * parte de la aplicación sin necesidad de importarlo explícitamente.
 */
@Module({
  providers: [YamlLoaderService, ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
