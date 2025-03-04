import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@libs/config';
import { CommonModule } from '@libs/common';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
