import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AvailabilityUseCase } from '../../application/ports/in/availability-use-case.interface';
import { CreateAvailabilityDto, UpdateAvailabilityDto, AvailabilityResponseDto } from '../dtos';
import { AvailabilityMapper } from '../mappers/availability.mapper';
import { CreateAvailabilityCommand } from '../../application/commands/create-availability.command';
import { UpdateAvailabilityCommand } from '../../application/commands/update-availability.command';
import { AvailabilityNotFoundException } from '../../domain/exceptions/availability-not-found.exception';
import { AvailabilityConflictException } from '../../domain/exceptions/availability-conflict.exception';
import { AvailabilityValidationException } from '../../domain/exceptions/availability-validation.exception';

@ApiTags('disponibilidad')
@Controller('availability')
export class AvailabilityController {
  constructor(
    @Inject('AvailabilityUseCase')
    private readonly availabilityUseCase: AvailabilityUseCase,
    private readonly availabilityMapper: AvailabilityMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva disponibilidad' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Disponibilidad creada exitosamente',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de disponibilidad inválidos',
  })
  async create(@Body() dto: CreateAvailabilityDto): Promise<AvailabilityResponseDto> {
    try {
      // Transformar strings a objetos Date
      const command = new CreateAvailabilityCommand(
        dto.professionalId,
        new Date(dto.availableDate),
        new Date(dto.startTime),
        new Date(dto.endTime),
        dto.isBooked,
      );

      const availability = await this.availabilityUseCase.createAvailability(command);
      return this.availabilityMapper.toResponseDto(availability);
    } catch (error) {
      if (error instanceof AvailabilityValidationException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof AvailabilityConflictException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener disponibilidad' })
  @ApiQuery({ name: 'professionalId', required: false, description: 'ID del profesional' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de disponibilidad',
    type: [AvailabilityResponseDto],
  })
  async findAll(
    @Query('professionalId') professionalId?: string,
  ): Promise<AvailabilityResponseDto[]> {
    if (professionalId) {
      const availabilities =
        await this.availabilityUseCase.findAvailabilityByProfessionalId(professionalId);
      return availabilities.map((availability) =>
        this.availabilityMapper.toResponseDto(availability),
      );
    }

    // Si no se proporciona un ID de profesional, devolvemos una lista vacía
    // En una implementación real, podríamos buscar todos los profesionales y su disponibilidad
    return [];
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener disponibilidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la disponibilidad' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Disponibilidad encontrada',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Disponibilidad no encontrada',
  })
  async findOne(@Param('id') id: string): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityUseCase.findAvailabilityById(id);
    if (!availability) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }
    return this.availabilityMapper.toResponseDto(availability);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar disponibilidad' })
  @ApiParam({ name: 'id', description: 'ID de la disponibilidad' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Disponibilidad actualizada exitosamente',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Disponibilidad no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de disponibilidad inválidos',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    try {
      const command = new UpdateAvailabilityCommand(
        dto.availableDate ? new Date(dto.availableDate) : undefined,
        dto.startTime ? new Date(dto.startTime) : undefined,
        dto.endTime ? new Date(dto.endTime) : undefined,
        dto.isBooked,
      );

      const availability = await this.availabilityUseCase.updateAvailability(id, command);
      return this.availabilityMapper.toResponseDto(availability);
    } catch (error) {
      if (error instanceof AvailabilityNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AvailabilityValidationException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof AvailabilityConflictException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar disponibilidad' })
  @ApiParam({ name: 'id', description: 'ID de la disponibilidad' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Disponibilidad eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Disponibilidad no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.availabilityUseCase.deleteAvailability(id);
    } catch (error) {
      if (error instanceof AvailabilityNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
