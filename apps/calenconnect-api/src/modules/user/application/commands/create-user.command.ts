import { UserRole } from '../../domain/value-objects/user-role.enum';

/**
 * Comando para crear un nuevo usuario
 */
export class CreateUserCommand {
  constructor(
    public readonly authUserId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRole,
  ) {}
}
