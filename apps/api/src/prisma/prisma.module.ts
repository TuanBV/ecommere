import { Global, Module } from '@nestjs/common';
import { DatabaseMigrationService } from './database-migration.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, DatabaseMigrationService],
  exports: [PrismaService]
})
export class PrismaModule {}
