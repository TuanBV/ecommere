import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProducts(query: ProductQueryDto) {
    const page = Math.max(query.page, 1);
    const limit = Math.min(Math.max(query.limit, 1), 60);
    const priceRange: Prisma.DecimalFilter = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {})
    };
    const priceFilter: Prisma.ProductWhereInput =
      query.minPrice !== undefined || query.maxPrice !== undefined
        ? { OR: [{ salePrice: { gt: 0, ...priceRange } }, { salePrice: 0, price: priceRange }] }
        : {};
    const where: Prisma.ProductWhereInput = {
      delFlag: 0,
      status: 1,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q } },
              { sku: { contains: query.q } },
              { slug: { contains: query.q } }
            ]
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.brand ? { brand: { slug: query.brand } } : {}),
      ...(query.inStock ? { stockQty: { gt: 0 } } : {}),
      ...priceFilter
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { salePrice: 'asc' }
        : query.sort === 'price_desc'
          ? { salePrice: 'desc' }
          : query.sort === 'best_seller'
            ? { soldCount: 'desc' }
            : { createdDate: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true, brand: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.product.count({ where })
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, delFlag: 0, status: 1 },
      include: {
        category: true,
        brand: true,
        policy: true,
        images: { where: { delFlag: 0 }, orderBy: { sortOrder: 'asc' } },
        reviews: { where: { delFlag: 0 }, include: { images: { where: { delFlag: 0 } } } }
      }
    });
    if (!product) throw new NotFoundException('Product not found');

    const variants = product.groupId
      ? await this.prisma.product.findMany({
          where: { groupId: product.groupId, delFlag: 0, status: 1 },
          select: { id: true, slug: true, color: true, size: true, variantName: true, stockQty: true }
        })
      : [];
    const related = await this.prisma.product.findMany({
      where: {
        id: { not: product.id },
        delFlag: 0,
        status: 1,
        OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }]
      },
      take: 8,
      orderBy: { soldCount: 'desc' }
    });
    return { ...product, variants, related };
  }

  findProductImages(productId: string) {
    return this.prisma.productImage.findMany({
      where: { productId, delFlag: 0 },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async findCategories() {
    const productGroups = await this.prisma.product.groupBy({
      by: ['categoryId', 'brandId'],
      where: {
        delFlag: 0,
        status: 1,
        category: { delFlag: 0 },
        brand: { delFlag: 0 }
      }
    });
    const categoryIds = [...new Set(productGroups.map((item) => item.categoryId))];
    const brandIds = [...new Set(productGroups.map((item) => item.brandId))];

    if (!categoryIds.length) return [];

    const [categories, brands] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where: { id: { in: categoryIds }, delFlag: 0 },
        orderBy: [{ priority: 'asc' }, { title: 'asc' }]
      }),
      this.prisma.brand.findMany({
        where: { id: { in: brandIds }, delFlag: 0 },
        orderBy: { title: 'asc' }
      })
    ]);
    const brandById = new Map(brands.map((brand) => [brand.id, brand]));

    return categories.map((category) => ({
      ...category,
      brands: productGroups
        .filter((item) => item.categoryId === category.id)
        .map((item) => brandById.get(item.brandId))
        .filter((brand): brand is NonNullable<typeof brand> => Boolean(brand))
    }));
  }

  async findBrands() {
    const productGroups = await this.prisma.product.groupBy({
      by: ['brandId'],
      where: { delFlag: 0, status: 1, brand: { delFlag: 0 } }
    });
    const brandIds = productGroups.map((item) => item.brandId);
    if (!brandIds.length) return [];

    return this.prisma.brand.findMany({
      where: { id: { in: brandIds }, delFlag: 0 },
      orderBy: { title: 'asc' }
    });
  }
}
