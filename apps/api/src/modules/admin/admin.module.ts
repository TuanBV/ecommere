import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repo';
import { AdminService } from './admin.service';
import { FacebookPostSchedulerService } from './facebook-post-scheduler.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, FacebookPostSchedulerService]
})
export class AdminModule {}
