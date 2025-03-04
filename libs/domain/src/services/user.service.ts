import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '@libs/database';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: {
    authUserId: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<User> {
    const existingUser = await this.userRepository.findByAuthId(data.authUserId);
    if (existingUser) {
      throw new ConflictException('Usuario ya existe con este ID de autenticación');
    }

    return this.userRepository.create(data);
  }

  async findByAuthUserId(authUserId: string): Promise<User | null> {
    return this.userRepository.findByAuthId(authUserId);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
    },
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.userRepository.update(id, data);
  }

  async findProfessionals(): Promise<User[]> {
    return this.userRepository.findByRole(UserRole.PROFESSIONAL);
  }

  async findPatients(): Promise<User[]> {
    return this.userRepository.findByRole(UserRole.PATIENT);
  }

  async validateUserRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.role === requiredRole;
  }
}
