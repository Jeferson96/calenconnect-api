import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../constants/roles.enum';
import { Observable } from 'rxjs';
import { Request } from 'express';

// Interfaz para representar un usuario con roles
interface UserWithRoles {
  id: string;
  roles: UserRole[];
  [key: string]: unknown;
}

// Extiende la interfaz Request para incluir el usuario
interface RequestWithUser extends Request {
  user?: UserWithRoles;
}

/**
 * Guardia para verificar si el usuario tiene los roles necesarios
 * para acceder a un recurso protegido
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Si no hay usuario en la request, denegar el acceso
    if (!user) {
      this.logger.warn('Intento de acceso a ruta protegida sin usuario autenticado');
      throw new ForbiddenException('No se ha proporcionado información de usuario');
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      this.logger.warn(`Usuario sin roles requeridos: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException('No tiene los permisos necesarios para acceder a este recurso');
    }

    return true;
  }
}
