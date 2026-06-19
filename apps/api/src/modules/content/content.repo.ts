import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ContactDto } from './dto/contact.dto';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  banners(position?: string) {
    return this.prisma.banner.findMany({
      where: { delFlag: 0, isActive: 1, ...(position ? { position } : {}) },
      orderBy: { updatedDate: 'desc' }
    });
  }

  sliders() {
    return this.prisma.slider.findMany({
      where: { delFlag: 0, isActive: true },
      orderBy: { position: 'asc' }
    });
  }

  async news(query: { page?: number; limit?: number; q?: string }) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 9), 1), 30);
    const keyword = query.q?.trim();
    const where = {
      delFlag: 0,
      status: 'PUBLISHED',
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { summary: { contains: keyword } },
              { slug: { contains: keyword } }
            ]
          }
        : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.news.findMany({
        where,
        orderBy: { createdDate: 'desc' },
        include: { category: true, brand: true },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.news.count({ where })
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async newsDetail(slug: string) {
    const item = await this.prisma.news.findFirst({
      where: { slug, delFlag: 0, status: 'PUBLISHED' },
      include: { category: true, brand: true, author: true }
    });
    if (!item) throw new NotFoundException('News not found');
    await this.prisma.news.update({ where: { id: item.id }, data: { viewCount: { increment: 1 } } });
    return item;
  }

  createReview(dto: ReviewDto) {
    return this.prisma.review.create({
      data: {
        id: randomUUID(),
        productId: dto.productId,
        reviewName: dto.reviewName,
        reviewEmail: dto.reviewEmail,
        content: dto.content,
        rating: dto.rating,
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
  }

  createContact(dto: ContactDto) {
    return this.prisma.contact.create({
      data: {
        id: randomUUID(),
        fullName: dto.fullName,
        phone: dto.phone,
        serviceType: dto.serviceType,
        message: dto.message,
        status: 'NEW',
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
  }
}
