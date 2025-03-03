import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigManagerModule } from '@libs/infrastructure/config-manager/config-manager.module';

@Module({
  imports: [ConfigManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
