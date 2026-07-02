import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseMigrationService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseMigrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureFacebookPostTable();
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : error);
    }
  }

  private async ensureFacebookPostTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS facebook_post (
        id VARCHAR(36) NOT NULL,
        page_id VARCHAR(100) NOT NULL,
        page_name VARCHAR(255) NULL,
        page_access_token LONGTEXT NULL,
        message TEXT NOT NULL,
        link_url VARCHAR(1000) NULL,
        image_url VARCHAR(1000) NULL,
        facebook_post_id VARCHAR(255) NULL,
        graph_version VARCHAR(20) NULL DEFAULT 'v20.0',
        status VARCHAR(30) NULL DEFAULT 'DRAFT',
        last_error TEXT NULL,
        scheduled_at TIMESTAMP(6) NULL,
        published_at TIMESTAMP(6) NULL,
        del_flag INT NULL DEFAULT 0,
        created_date TIMESTAMP(6) NULL,
        updated_date TIMESTAMP(6) NULL,
        PRIMARY KEY (id),
        INDEX idx_facebook_post_page (page_id),
        INDEX idx_facebook_post_status (status),
        INDEX idx_facebook_post_scheduled (scheduled_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await this.addColumnIfMissing('facebook_post', 'scheduled_at', 'TIMESTAMP(6) NULL');
    await this.addIndexIfMissing('facebook_post', 'idx_facebook_post_scheduled', 'scheduled_at');
  }

  private async addColumnIfMissing(table: string, column: string, definition: string) {
    const rows = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `
        SELECT COUNT(*) AS count
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      table,
      column
    );
    if (Number(rows[0]?.count ?? 0) > 0) return;
    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
    );
  }

  private async addIndexIfMissing(table: string, indexName: string, column: string) {
    const rows = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `
        SELECT COUNT(*) AS count
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND INDEX_NAME = ?
      `,
      table,
      indexName
    );
    if (Number(rows[0]?.count ?? 0) > 0) return;
    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (\`${column}\`)`
    );
  }
}
