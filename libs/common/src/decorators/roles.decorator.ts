import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants/roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorador para asignar roles a un controlador o método
 * @param roles - Lista de roles permitidos
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
