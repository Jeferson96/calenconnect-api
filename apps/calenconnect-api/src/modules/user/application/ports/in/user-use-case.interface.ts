import { UserEntity } from '../../../domain/entities/user.entity';
import { CreateUserCommand } from '../../commands/create-user.command';
import { UpdateUserCommand } from '../../commands/update-user.command';

/**
 * Puerto primario (entrada) para los casos de uso relacionados con usuarios
 */
export interface UserUseCase {
  /**
   * Crea un nuevo usuario
   */
  createUser(command: CreateUserCommand): Promise<UserEntity>;

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: string, command: UpdateUserCommand): Promise<UserEntity>;

  /**
   * Busca un usuario por su ID
   */
  findUserById(id: string): Promise<UserEntity | null>;

  /**
   * Obtiene todos los usuarios
   */
  findAllUsers(): Promise<UserEntity[]>;

  /**
   * Obtiene todos los profesionales
   */
  findProfessionals(): Promise<UserEntity[]>;

  /**
   * Obtiene todos los pacientes
   */
  findPatients(): Promise<UserEntity[]>;
}
