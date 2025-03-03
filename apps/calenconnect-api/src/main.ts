import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CalenconnectApiConfig } from '@libs/infrastructure/config-manager/interfaces/calenconnect-api.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger: Logger = new Logger('Calenconnect API');

  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const calenconnectApiConfig: CalenconnectApiConfig =
    config.get<CalenconnectApiConfig>('calenconnect-api')!;

  if (!calenconnectApiConfig) {
    logger.error('Calenconnect API configuration not found');
    process.exit(1);
  }

  const PORT = calenconnectApiConfig?.port || 3000;

  await app.listen(PORT);

  logger.log(`Calenconnect API is running on port ${PORT}`);
}
bootstrap();
