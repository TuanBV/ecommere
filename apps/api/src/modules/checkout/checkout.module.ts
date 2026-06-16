import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutRepository } from './checkout.repo';
import { CheckoutService } from './checkout.service';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, CheckoutRepository]
})
export class CheckoutModule {}
