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
import { AppointmentUseCase } from '../../application/ports/in/appointment-use-case.interface';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponseDto } from '../dtos';
import { AppointmentMapper } from '../mappers/appointment.mapper';
import { CreateAppointmentCommand } from '../../application/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../../application/commands/update-appointment.command';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.enum';
import { AppointmentNotFoundException } from '../../domain/exceptions/appointment-not-found.exception';
import { AppointmentValidationException } from '../../domain/exceptions/appointment-validation.exception';
import { AppointmentInvalidStatusException } from '../../domain/exceptions/appointment-invalid-status.exception';

@ApiTags('citas')
@Controller('appointments')
export class AppointmentController {
  constructor(
    @Inject('AppointmentUseCase')
    private readonly appointmentUseCase: AppointmentUseCase,
    private readonly appointmentMapper: AppointmentMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva cita' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cita creada exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de cita inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'La fecha y hora seleccionada no está disponible',
  })
  async create(@Body() dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    try {
      const command = new CreateAppointmentCommand(
        dto.patientId,
        dto.professionalId,
        new Date(dto.appointmentDate),
        dto.status as AppointmentStatus,
      );

      const appointment = await this.appointmentUseCase.createAppointment(command);
      return this.appointmentMapper.toResponseDto(appointment);
    } catch (error) {
      if (error instanceof AppointmentValidationException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener citas' })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'ID del paciente',
  })
  @ApiQuery({
    name: 'professionalId',
    required: false,
    description: 'ID del profesional',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Estado de la cita',
    enum: AppointmentStatus,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de citas',
    type: [AppointmentResponseDto],
  })
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('professionalId') professionalId?: string,
    @Query('status') status?: AppointmentStatus,
  ): Promise<AppointmentResponseDto[]> {
    let appointments: any[] = [];

    if (patientId) {
      appointments = await this.appointmentUseCase.findAppointmentsByPatientId(patientId);
    } else if (professionalId) {
      appointments = await this.appointmentUseCase.findAppointmentsByProfessionalId(professionalId);
    } else if (status) {
      appointments = await this.appointmentUseCase.findAppointmentsByStatus(status);
    } else {
      // En una implementación real, podríamos paginarlo
      appointments = []; // Implementar una búsqueda genérica
    }

    return appointments.map((appointment) => this.appointmentMapper.toResponseDto(appointment));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener cita por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cita encontrada',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita no encontrada',
  })
  async findOne(@Param('id') id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentUseCase.findAppointmentById(id);
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    return this.appointmentMapper.toResponseDto(appointment);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar cita' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cita actualizada exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de cita inválidos',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    try {
      const command = new UpdateAppointmentCommand(
        dto.appointmentDate ? new Date(dto.appointmentDate) : undefined,
        dto.status as AppointmentStatus,
      );

      const appointment = await this.appointmentUseCase.updateAppointment(id, command);
      return this.appointmentMapper.toResponseDto(appointment);
    } catch (error) {
      if (error instanceof AppointmentNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AppointmentValidationException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof AppointmentInvalidStatusException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar cita como completada' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cita completada exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se puede completar la cita debido a su estado actual',
  })
  async complete(@Param('id') id: string): Promise<AppointmentResponseDto> {
    try {
      const appointment = await this.appointmentUseCase.completeAppointment(id);
      return this.appointmentMapper.toResponseDto(appointment);
    } catch (error) {
      if (error instanceof AppointmentNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AppointmentInvalidStatusException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar cita' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cita cancelada exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se puede cancelar la cita debido a su estado actual',
  })
  async cancel(@Param('id') id: string): Promise<AppointmentResponseDto> {
    try {
      const appointment = await this.appointmentUseCase.cancelAppointment(id);
      return this.appointmentMapper.toResponseDto(appointment);
    } catch (error) {
      if (error instanceof AppointmentNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AppointmentInvalidStatusException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar cita' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cita eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.appointmentUseCase.deleteAppointment(id);
    } catch (error) {
      if (error instanceof AppointmentNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
