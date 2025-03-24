import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@libs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { HttpExceptionFilter, ResponseTransformInterceptor } from '@libs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener configuración
  const configService = app.get(ConfigService);
  const port = configService.get<number>('calenconnect-api.port') || 3000;

  // Configurar prefijo global
  app.setGlobalPrefix('api');

  // Configurar CORS
  app.enableCors({
    origin: '*', // En producción, esto debería ser más restrictivo
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Rechaza solicitudes con propiedades no definidas
      transform: true, // Transforma automáticamente los datos a los tipos definidos
    }),
  );

  // Configurar interceptor y filtro global
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configurar Swagger
  setupSwagger(app);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}

bootstrap();
