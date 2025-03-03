import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@libs/config';
import { PrismaService } from './prisma.service';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => PrismaService.getInstance(),
    },
    {
      provide: SupabaseService,
      useFactory: (configService: ConfigService) => {
        return new SupabaseService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService, SupabaseService],
})
export class DatabaseModule {}
