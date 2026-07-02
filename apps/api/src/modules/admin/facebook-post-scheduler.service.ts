import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AdminRepository } from './admin.repo';

@Injectable()
export class FacebookPostSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FacebookPostSchedulerService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly adminRepository: AdminRepository) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.publishDuePosts(), 60_000);
    void this.publishDuePosts();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async publishDuePosts() {
    if (this.running) return;
    this.running = true;
    try {
      await this.adminRepository.publishDueFacebookPosts();
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : error);
    } finally {
      this.running = false;
    }
  }
}
