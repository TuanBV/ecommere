import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.client = new Redis(url, { maxRetriesPerRequest: 2 });
    this.client.on('error', (err) => this.logger.warn(`Redis connection error: ${err.message}`));
  }

  async onModuleDestroy() {
    await this.client.quit().catch(() => undefined);
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const raw = await this.client.get(key);
      return raw === null ? undefined : (JSON.parse(raw) as T);
    } catch (err) {
      this.logger.warn(`get(${key}) failed: ${(err as Error).message}`);
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`set(${key}) failed: ${(err as Error).message}`);
    }
  }

  /** Cache-aside helper: returns the cached value, or loads, caches and returns it. */
  async getOrSet<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /** Deletes every key under a prefix, used to invalidate a cache namespace after a write. */
  async delByPrefix(prefix: string): Promise<void> {
    try {
      const keys: string[] = [];
      const stream = this.client.scanStream({ match: `${prefix}*`, count: 200 });
      for await (const batch of stream) keys.push(...(batch as string[]));
      if (keys.length) await this.client.unlink(...keys);
    } catch (err) {
      this.logger.warn(`delByPrefix(${prefix}) failed: ${(err as Error).message}`);
    }
  }
}
