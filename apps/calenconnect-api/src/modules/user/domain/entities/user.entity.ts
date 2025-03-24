import { UserRole } from '../value-objects/user-role.enum';

/**
 * Entidad de dominio que representa un usuario en el sistema
 */
export class UserEntity {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  role: UserRole;

  constructor(props: {
    id?: string;
    authUserId: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) {
    this.id = props.id || '';
    this.authUserId = props.authUserId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.role = props.role;
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Verifica si el usuario es un profesional
   */
  isProfessional(): boolean {
    return this.role === UserRole.PROFESSIONAL;
  }

  /**
   * Verifica si el usuario es un paciente
   */
  isPatient(): boolean {
    return this.role === UserRole.PATIENT;
  }

  /**
   * Verifica si el usuario es un administrador
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
