import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Interceptor para transformar todas las respuestas exitosas en un formato estándar
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        message: this.getDefaultMessage(response.statusCode),
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Operación realizada con éxito';
      case 201:
        return 'Recurso creado con éxito';
      default:
        return 'Solicitud procesada correctamente';
    }
  }
}
