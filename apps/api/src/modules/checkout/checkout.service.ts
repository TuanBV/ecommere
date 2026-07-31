import { Injectable } from '@nestjs/common';
import { CATALOG_CACHE_PREFIX } from '../catalog/catalog.service';
import { RedisService } from '../../redis/redis.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutRepository } from './checkout.repo';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly redis: RedisService
  ) {}

  async createOrder(dto: CheckoutDto) {
    const result = await this.checkoutRepository.createOrder(dto);
    await this.redis.delByPrefix(CATALOG_CACHE_PREFIX);
    return result;
  }

  track(orderId: string, phone: string) {
    return this.checkoutRepository.track(orderId, phone);
  }
}
