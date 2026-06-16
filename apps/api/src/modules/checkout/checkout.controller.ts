import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ok } from '../../common/api-response';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('checkout')
@Controller()
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('checkout')
  async create(@Body() dto: CheckoutDto) {
    return ok(await this.checkout.createOrder(dto));
  }

  @Get('orders/track')
  async track(@Query('orderId') orderId: string, @Query('phone') phone: string) {
    return ok(await this.checkout.track(orderId, phone));
  }
}
