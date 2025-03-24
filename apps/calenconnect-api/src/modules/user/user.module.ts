import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserService } from './application/user.service';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

/**
 * Módulo de usuarios implementado siguiendo principios de arquitectura limpia y DDD
 */
@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    UserMapper,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'UserUseCase',
      useClass: UserService,
    },
    UserService,
  ],
  exports: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'UserUseCase',
      useClass: UserService,
    },
  ],
})
export class UserModule {}
