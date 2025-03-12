import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserUseCase } from '../../application/ports/in/user-use-case.interface';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos';
import { UserMapper } from '../mappers/user.mapper';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { UpdateUserCommand } from '../../application/commands/update-user.command';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

@ApiTags('usuarios')
@Controller('users')
export class UserController {
  constructor(
    @Inject('UserUseCase')
    private readonly userUseCase: UserUseCase,
    private readonly userMapper: UserMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El usuario ya existe con este ID de autenticación',
  })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const command = new CreateUserCommand(dto.authUserId, dto.firstName, dto.lastName, dto.role);

      const user = await this.userUseCase.createUser(command);
      return this.userMapper.toResponseDto(user);
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuarios',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userUseCase.findAllUsers();
    return users.map((user) => this.userMapper.toResponseDto(user));
  }

  @Get('professionals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los profesionales' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de profesionales',
    type: [UserResponseDto],
  })
  async findProfessionals(): Promise<UserResponseDto[]> {
    const professionals = await this.userUseCase.findProfessionals();
    return professionals.map((user) => this.userMapper.toResponseDto(user));
  }

  @Get('patients')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pacientes',
    type: [UserResponseDto],
  })
  async findPatients(): Promise<UserResponseDto[]> {
    const patients = await this.userUseCase.findPatients();
    return patients.map((user) => this.userMapper.toResponseDto(user));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario encontrado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userUseCase.findUserById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.userMapper.toResponseDto(user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const command = new UpdateUserCommand(dto.firstName, dto.lastName, dto.role);

      const user = await this.userUseCase.updateUser(id, command);
      return this.userMapper.toResponseDto(user);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
