import { Module } from '@nestjs/common';
import { ConfigModule } from '@libs/config';

@Module({
  imports: [ConfigModule],
  providers: [],
  exports: [ConfigModule],
})
export class InfrastructureModule {}
