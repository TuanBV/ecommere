import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CheckoutDto) {
    const ids = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids }, delFlag: 0, status: 1 }
    });
    if (products.length !== ids.length) throw new BadRequestException('Invalid product in cart');

    const productById = new Map(products.map((product) => [product.id, product]));
    let total = new Prisma.Decimal(0);
    const details = dto.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) throw new BadRequestException('Invalid product in cart');
      if (product.stockQty < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.title}`);
      }
      const unitPrice = product.salePrice.gt(0) ? product.salePrice : product.price;
      total = total.plus(unitPrice.mul(item.quantity));
      return { product, quantity: item.quantity, unitPrice };
    });

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          id: randomUUID(),
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          shippingAddress: dto.shippingAddress,
          note: dto.note,
          paymentMethod: dto.paymentMethod,
          totalAmount: total,
          status: 'PENDING',
          createdDate: new Date(),
          updatedDate: new Date()
        }
      });

      for (const detail of details) {
        const updated = await tx.product.updateMany({
          where: { id: detail.product.id, stockQty: { gte: detail.quantity } },
          data: { stockQty: { decrement: detail.quantity } }
        });
        if (updated.count !== 1) throw new BadRequestException(`Stock changed for ${detail.product.title}`);
        await tx.orderDetail.create({
          data: {
            id: randomUUID(),
            orderId: order.id,
            productId: detail.product.id,
            price: detail.unitPrice,
            quantity: detail.quantity,
            createdDate: new Date(),
            updatedDate: new Date()
          }
        });
      }
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { details: true } });
    });
  }

  async track(orderId: string, phone: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerPhone: phone, delFlag: 0 },
      include: { details: { include: { product: true } } }
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
