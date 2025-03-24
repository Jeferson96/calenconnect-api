import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CalenConnect API')
    .setDescription('API para el sistema de agendamiento de citas CalenConnect')
    .setVersion('1.0')
    .addTag('usuarios', 'Operaciones relacionadas con usuarios')
    .addTag('citas', 'Operaciones relacionadas con citas')
    .addTag('disponibilidad', 'Operaciones relacionadas con disponibilidad')
    .addTag('notificaciones', 'Operaciones relacionadas con notificaciones')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
