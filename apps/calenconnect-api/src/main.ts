import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@libs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger: Logger = new Logger('Calenconnect API');

  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const appConfig = config.getAppConfig();

  if (!appConfig) {
    logger.error('Configuración de CalenConnect API no encontrada');
    process.exit(1);
  }

  const PORT = appConfig.port || 3000;

  await app.listen(PORT);

  logger.log(`CalenConnect API está ejecutándose en el puerto ${PORT}`);
}
bootstrap();
