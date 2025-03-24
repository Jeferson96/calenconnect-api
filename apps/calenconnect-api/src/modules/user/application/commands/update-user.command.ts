import { UserRole } from '../../domain/value-objects/user-role.enum';

/**
 * Comando para actualizar un usuario existente
 */
export class UpdateUserCommand {
  constructor(
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly role?: UserRole,
  ) {}
}
