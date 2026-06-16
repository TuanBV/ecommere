import { Injectable } from '@nestjs/common';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutRepository } from './checkout.repo';

@Injectable()
export class CheckoutService {
  constructor(private readonly checkoutRepository: CheckoutRepository) {}

  createOrder(dto: CheckoutDto) {
    return this.checkoutRepository.createOrder(dto);
  }

  track(orderId: string, phone: string) {
    return this.checkoutRepository.track(orderId, phone);
  }
}
