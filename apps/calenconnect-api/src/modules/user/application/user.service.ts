import { Inject, Injectable } from '@nestjs/common';
import { UserUseCase } from './ports/in/user-use-case.interface';
import { UserRepository } from './ports/out/user-repository.interface';
import { UserEntity } from '../domain/entities/user.entity';
import { CreateUserCommand } from './commands/create-user.command';
import { UpdateUserCommand } from './commands/update-user.command';
import { UserAlreadyExistsException } from '../domain/exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../domain/exceptions/user-not-found.exception';
import { UserRole } from '../domain/value-objects/user-role.enum';

/**
 * Implementación de los casos de uso de usuario
 */
@Injectable()
export class UserService implements UserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Crea un nuevo usuario
   */
  async createUser(command: CreateUserCommand): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByAuthId(command.authUserId);

    if (existingUser) {
      throw new UserAlreadyExistsException(command.authUserId);
    }

    const user = new UserEntity({
      authUserId: command.authUserId,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
    });

    return this.userRepository.save(user);
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(id: string, command: UpdateUserCommand): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return this.userRepository.update(id, {
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
    });
  }

  /**
   * Busca un usuario por su ID
   */
  async findUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  /**
   * Obtiene todos los profesionales
   */
  async findProfessionals(): Promise<UserEntity[]> {
    return this.userRepository.findByRole(UserRole.PROFESSIONAL);
  }

  /**
   * Obtiene todos los pacientes
   */
  async findPatients(): Promise<UserEntity[]> {
    return this.userRepository.findByRole(UserRole.PATIENT);
  }
}
