import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard, Roles, RolesGuard, UserRole } from '@libs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('professionals')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  getProfessionals(): string {
    return 'Access to professionals information granted';
  }

  @Get('patients')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT, UserRole.ADMIN)
  getPatients(): string {
    return 'Access to patients information granted';
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdmin(): string {
    return 'Access to admin panel granted';
  }
}
