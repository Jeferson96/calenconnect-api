import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters';
import { ResponseTransformInterceptor } from './interceptors';
import { AuthGuard, RolesGuard } from './guards';

/**
 * Módulo común que proporciona utilidades reutilizables como
 * guardias, filtros, interceptores y decoradores
 */
@Module({
  providers: [HttpExceptionFilter, ResponseTransformInterceptor, AuthGuard, RolesGuard],
  exports: [HttpExceptionFilter, ResponseTransformInterceptor, AuthGuard, RolesGuard],
})
export class CommonModule {}
