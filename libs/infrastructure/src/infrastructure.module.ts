import { Module } from '@nestjs/common';
import { ConfigManagerModule } from './config-manager/config-manager.module';

@Module({
  imports: [ConfigManagerModule],
  providers: [],
  exports: [ConfigManagerModule],
})
export class InfrastructureModule {}
