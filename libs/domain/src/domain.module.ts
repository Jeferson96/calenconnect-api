import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';

@Module({
  imports: [DatabaseModule],
  providers: [],
  exports: [],
})
export class DomainModule {}
