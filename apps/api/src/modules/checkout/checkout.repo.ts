import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CheckoutDto) {
    const supportedPaymentMethods = ['COD', 'BANK_TRANSFER', 'installment'];
    if (!supportedPaymentMethods.includes(dto.paymentMethod)) {
      throw new BadRequestException('Unsupported payment method');
    }

    const isInstallment = dto.paymentMethod === 'installment';
    if (isInstallment && dto.items.length !== 1) {
      throw new BadRequestException('Installment checkout supports one product only');
    }
    if (
      !isInstallment &&
      (dto.installmentTerm !== undefined || dto.installmentDownPayment !== undefined)
    ) {
      throw new BadRequestException('Installment details require installment payment');
    }

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

    let installmentTerm: number | null = null;
    let installmentDownPayment: Prisma.Decimal | null = null;
    let installmentMonthlyAmount: Prisma.Decimal | null = null;

    if (isInstallment) {
      if (!dto.installmentTerm || ![3, 6, 9, 12].includes(dto.installmentTerm)) {
        throw new BadRequestException('Unsupported installment term');
      }
      if (total.lt(3_000_000)) {
        throw new BadRequestException('Order is below the installment minimum');
      }

      const downPayment = new Prisma.Decimal(dto.installmentDownPayment ?? -1);
      const minimumDownPayment = total.mul(0.2);
      if (downPayment.lt(minimumDownPayment) || downPayment.gt(total)) {
        throw new BadRequestException('Invalid installment down payment');
      }

      installmentTerm = dto.installmentTerm;
      installmentDownPayment = downPayment;
      installmentMonthlyAmount = total
        .minus(downPayment)
        .div(installmentTerm)
        .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    }

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
          installmentTerm,
          installmentDownPayment,
          installmentMonthlyAmount,
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
        if (updated.count !== 1)
          throw new BadRequestException(`Stock changed for ${detail.product.title}`);
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
