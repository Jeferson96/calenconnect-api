import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/value-objects/user-role.enum';

/**
 * Puerto secundario (salida) para las operaciones de persistencia de usuarios
 */
export interface UserRepository {
  /**
   * Guarda un usuario en la persistencia
   */
  save(user: UserEntity): Promise<UserEntity>;

  /**
   * Busca un usuario por su ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Busca un usuario por su ID de autenticación
   */
  findByAuthId(authId: string): Promise<UserEntity | null>;

  /**
   * Busca usuarios por su rol
   */
  findByRole(role: UserRole): Promise<UserEntity[]>;

  /**
   * Actualiza un usuario existente
   */
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;

  /**
   * Encuentra todos los usuarios
   */
  findAll(): Promise<UserEntity[]>;
}
