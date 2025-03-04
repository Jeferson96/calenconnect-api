import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

/**
 * Guardia para verificar la autenticación de usuarios
 *
 * Verifica si la petición contiene un token de autenticación válido
 * en el encabezado 'Authorization'
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('No se ha proporcionado token de autenticación');
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Token de autenticación inválido');
      }

      // Aquí iría la lógica de verificación del token
      // Por ahora, simplemente validamos que exista

      // También se podría añadir el usuario a la request para usarlo en los controladores
      // request['user'] = decodedUser;

      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Falló la autenticación: ${errorMessage}`);
      throw new UnauthorizedException('Autenticación fallida');
    }
  }
}
