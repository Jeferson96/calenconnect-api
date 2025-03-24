/**
 * Excepción lanzada cuando se intenta crear un usuario que ya existe
 */
export class UserAlreadyExistsException extends Error {
  constructor(authUserId: string) {
    super(`El usuario con ID de autenticación ${authUserId} ya existe`);
    this.name = 'UserAlreadyExistsException';
  }
}
