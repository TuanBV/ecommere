import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminBannerDto,
  AdminContactStatusDto,
  AdminOrderStatusDto,
  AdminNewsDto,
  AdminPolicyDto,
  AdminProductDto,
  AdminSettingDto,
  AdminSliderDto,
  AdminTaxonomyDto,
  AdminUserDto,
  UpdateAdminBannerDto,
  UpdateAdminNewsDto,
  UpdateAdminPolicyDto,
  UpdateAdminProductDto,
  UpdateAdminSliderDto,
  UpdateAdminTaxonomyDto,
  UpdateAdminUserDto
} from './dto/admin.dto';

type AdminTable = 'category' | 'brand' | 'review' | 'banner' | 'slider' | 'news' | 'contact' | 'policy';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [revenue, orderCount, newOrders, lowStock, topProducts] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        where: { delFlag: 0, status: { in: ['CONFIRMED', 'SHIPPING', 'COMPLETED'] } },
        _sum: { totalAmount: true }
      }),
      this.prisma.order.count({ where: { delFlag: 0 } }),
      this.prisma.order.count({ where: { delFlag: 0, status: 'PENDING' } }),
      this.prisma.product.findMany({ where: { delFlag: 0, stockQty: { lte: 5 } }, take: 10 }),
      this.prisma.product.findMany({
        where: { delFlag: 0 },
        orderBy: { soldCount: 'desc' },
        take: 10
      })
    ]);
    return { revenue: revenue._sum.totalAmount ?? 0, orderCount, newOrders, lowStock, topProducts };
  }

  products(q?: string) {
    return this.prisma.product.findMany({
      where: {
        delFlag: 0,
        ...(q
          ? {
              OR: [{ title: { contains: q } }, { sku: { contains: q } }, { slug: { contains: q } }]
            }
          : {})
      },
      include: { category: true, brand: true, images: { where: { delFlag: 0 }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { updatedDate: 'desc' },
      take: 100
    });
  }

  async createProduct(body: AdminProductDto) {
    const id = randomUUID();
    const images = normalizeImages(body.images);
    const relatedProductIds = normalizeIds(body.relatedProductIds).filter((item) => item !== id);
    const groupId = body.groupId
      ? String(body.groupId)
      : relatedProductIds.length
        ? randomUUID()
        : null;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
        id,
        title: String(body.title),
        sku: String(body.sku),
        slug: String(body.slug),
        categoryId: String(body.categoryId),
        brandId: String(body.brandId),
        ...(body.policyId ? { policyId: String(body.policyId) } : {}),
        price: new Prisma.Decimal(String(body.price ?? 0)),
        salePrice: new Prisma.Decimal(String(body.salePrice ?? 0)),
        stockQty: Number(body.stockQty ?? 0),
        status: Number(body.status ?? 1),
        image: body.image ? String(body.image) : null,
        description: body.description ? String(body.description) : null,
        content: body.content ? String(body.content) : null,
        specification: body.specification ? String(body.specification) : null,
        variantName: body.variantName ? String(body.variantName) : null,
        color: body.color ? String(body.color) : null,
        size: body.size ? String(body.size) : null,
        groupId,
        createdDate: new Date(),
        updatedDate: new Date()
      }
      });

      if (groupId && relatedProductIds.length) {
        await tx.product.updateMany({
          where: { id: { in: relatedProductIds }, delFlag: 0 },
          data: { groupId, updatedDate: new Date() }
        });
      }

      if (images.length) {
        await tx.productImage.createMany({
          data: images.map((imageUrl, index) => ({
            id: randomUUID(),
            productId: id,
            imageUrl,
            sortOrder: index,
            delFlag: 0,
            createdDate: new Date(),
            updatedDate: new Date()
          }))
        });
      }

      return product;
    });
  }

  async updateProduct(id: string, body: UpdateAdminProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const relatedProductIds =
        body.relatedProductIds !== undefined
          ? normalizeIds(body.relatedProductIds).filter((item) => item !== id)
          : undefined;
      const current =
        relatedProductIds !== undefined
          ? await tx.product.findUnique({ where: { id }, select: { groupId: true } })
          : null;
      const nextGroupId =
        body.groupId !== undefined
          ? body.groupId
            ? String(body.groupId)
            : null
          : relatedProductIds !== undefined
            ? relatedProductIds.length
              ? (current?.groupId ?? randomUUID())
              : null
            : undefined;

      const product = await tx.product.update({
        where: { id },
        data: {
          ...(body.title !== undefined ? { title: String(body.title) } : {}),
          ...(body.sku !== undefined ? { sku: String(body.sku) } : {}),
          ...(body.slug !== undefined ? { slug: String(body.slug) } : {}),
          ...(body.categoryId !== undefined ? { categoryId: String(body.categoryId) } : {}),
          ...(body.brandId !== undefined ? { brandId: String(body.brandId) } : {}),
          ...(body.policyId !== undefined
            ? { policyId: body.policyId ? String(body.policyId) : null }
            : {}),
          ...(body.price !== undefined ? { price: new Prisma.Decimal(String(body.price)) } : {}),
          ...(body.salePrice !== undefined
            ? { salePrice: new Prisma.Decimal(String(body.salePrice)) }
            : {}),
          ...(body.stockQty !== undefined ? { stockQty: Number(body.stockQty) } : {}),
          ...(body.status !== undefined ? { status: Number(body.status) } : {}),
          ...(body.image !== undefined ? { image: body.image ? String(body.image) : null } : {}),
          ...(body.description !== undefined
            ? { description: body.description ? String(body.description) : null }
            : {}),
          ...(body.content !== undefined ? { content: body.content ? String(body.content) : null } : {}),
          ...(body.specification !== undefined
            ? { specification: body.specification ? String(body.specification) : null }
            : {}),
          ...(body.variantName !== undefined
            ? { variantName: body.variantName ? String(body.variantName) : null }
            : {}),
          ...(body.color !== undefined ? { color: body.color ? String(body.color) : null } : {}),
          ...(body.size !== undefined ? { size: body.size ? String(body.size) : null } : {}),
          ...(nextGroupId !== undefined ? { groupId: nextGroupId } : {}),
          updatedDate: new Date()
        }
      });

      if (relatedProductIds !== undefined && nextGroupId) {
        await tx.product.updateMany({
          where: { id: { in: relatedProductIds }, delFlag: 0 },
          data: { groupId: nextGroupId, updatedDate: new Date() }
        });
      }

      if (relatedProductIds !== undefined && current?.groupId) {
        await tx.product.updateMany({
          where: {
            groupId: current.groupId,
            id: { notIn: [id, ...relatedProductIds] },
            delFlag: 0
          },
          data: { groupId: null, updatedDate: new Date() }
        });
      }

      if (body.images !== undefined) {
        await tx.productImage.updateMany({
          where: { productId: id, delFlag: 0 },
          data: { delFlag: 1, updatedDate: new Date() }
        });
        const images = normalizeImages(body.images);
        if (images.length) {
          await tx.productImage.createMany({
            data: images.map((imageUrl, index) => ({
              id: randomUUID(),
              productId: id,
              imageUrl,
              sortOrder: index,
              delFlag: 0,
              createdDate: new Date(),
              updatedDate: new Date()
            }))
          });
        }
      }

      return product;
    });
  }

  softDeleteProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() }
    });
  }

  orders() {
    return this.prisma.order.findMany({
      where: { delFlag: 0 },
      include: { details: true },
      orderBy: { createdDate: 'desc' },
      take: 100
    });
  }

  order(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { details: { include: { product: { include: { category: true } } } } }
    });
  }

  async updateOrderStatus(id: string, status: string, adminNote?: string) {
    if (!Object.values(OrderStatus).includes(status as OrderStatus))
      throw new BadRequestException('Invalid status');
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus, adminNote, updatedDate: new Date() },
      include: { details: true }
    });
    if (status === 'COMPLETED') {
      await this.prisma.$transaction(
        order.details.map((detail) =>
          this.prisma.product.update({
            where: { id: detail.productId },
            data: { soldCount: { increment: detail.quantity } }
          })
        )
      );
    }
    return order;
  }

  table(table: AdminTable) {
    switch (table) {
      case 'category':
        return this.prisma.category.findMany({ where: { delFlag: 0 }, take: 100 });
      case 'brand':
        return this.prisma.brand.findMany({ where: { delFlag: 0 }, take: 100 });
      case 'review':
        return this.prisma.review.findMany({ where: { delFlag: 0 }, take: 100 });
      case 'banner':
        return this.prisma.banner.findMany({ where: { delFlag: 0 }, take: 100 });
      case 'slider':
        return this.prisma.slider.findMany({ where: { delFlag: 0 }, take: 100 });
      case 'news':
        return this.prisma.news.findMany({ where: { delFlag: 0 }, take: 100 });
      case 'contact':
        return this.prisma.contact.findMany({ where: { delFlag: 0 }, take: 100 });
      case 'policy':
        return this.prisma.policy.findMany({
          where: { delFlag: 0 },
          include: {
            products: {
              where: { delFlag: 0 },
              select: { id: true, title: true, sku: true },
              orderBy: { updatedDate: 'desc' }
            }
          },
          orderBy: { updatedDate: 'desc' },
          take: 100
        });
    }
  }

  createCategory(body: AdminTaxonomyDto) {
    return this.prisma.category.create({
      data: {
        id: randomUUID(),
        title: String(body.title ?? '').trim(),
        slug: body.slug ? String(body.slug).trim() : null,
        logo: body.logo ? String(body.logo).trim() : null,
        priority: Number(body.priority ?? 0),
        delFlag: 0,
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
  }

  updateCategory(id: string, body: UpdateAdminTaxonomyDto) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
        ...(body.slug !== undefined ? { slug: body.slug ? String(body.slug).trim() : null } : {}),
        ...(body.logo !== undefined ? { logo: body.logo ? String(body.logo).trim() : null } : {}),
        ...(body.priority !== undefined ? { priority: Number(body.priority) } : {}),
        updatedDate: new Date()
      }
    });
  }

  softDeleteCategory(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() }
    });
  }

  createBrand(body: AdminTaxonomyDto) {
    return this.prisma.brand.create({
      data: {
        id: randomUUID(),
        title: String(body.title ?? '').trim(),
        slug: body.slug ? String(body.slug).trim() : null,
        logo: body.logo ? String(body.logo).trim() : null,
        delFlag: 0,
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
  }

  updateBrand(id: string, body: UpdateAdminTaxonomyDto) {
    return this.prisma.brand.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
        ...(body.slug !== undefined ? { slug: body.slug ? String(body.slug).trim() : null } : {}),
        ...(body.logo !== undefined ? { logo: body.logo ? String(body.logo).trim() : null } : {}),
        updatedDate: new Date()
      }
    });
  }

  softDeleteBrand(id: string) {
    return this.prisma.brand.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() }
    });
  }

  async createPolicy(body: AdminPolicyDto) {
    const id = randomUUID();
    const productIds = normalizeIds(body.productIds);

    return this.prisma.$transaction(async (tx) => {
      const policy = await tx.policy.create({
        data: {
          id,
          packageName: String(body.packageName ?? '').trim(),
          policies: normalizeJsonList(body.policies),
          afterSales: normalizeJsonList(body.afterSales),
          gifts: normalizeJsonList(body.gifts),
          isActive: Number(body.isActive ?? 1),
          delFlag: 0,
          createdDate: new Date(),
          updatedDate: new Date()
        }
      });

      if (productIds.length) {
        await tx.product.updateMany({
          where: { id: { in: productIds }, delFlag: 0 },
          data: { policyId: id, updatedDate: new Date() }
        });
      }

      return policy;
    });
  }

  async updatePolicy(id: string, body: UpdateAdminPolicyDto) {
    const productIds = body.productIds !== undefined ? normalizeIds(body.productIds) : undefined;

    return this.prisma.$transaction(async (tx) => {
      const policy = await tx.policy.update({
        where: { id },
        data: {
          ...(body.packageName !== undefined
            ? { packageName: String(body.packageName).trim() }
            : {}),
          ...(body.policies !== undefined ? { policies: normalizeJsonList(body.policies) } : {}),
          ...(body.afterSales !== undefined
            ? { afterSales: normalizeJsonList(body.afterSales) }
            : {}),
          ...(body.gifts !== undefined ? { gifts: normalizeJsonList(body.gifts) } : {}),
          ...(body.isActive !== undefined ? { isActive: Number(body.isActive) } : {}),
          updatedDate: new Date()
        }
      });

      if (productIds !== undefined) {
        await tx.product.updateMany({
          where: { policyId: id, id: { notIn: productIds }, delFlag: 0 },
          data: { policyId: null, updatedDate: new Date() }
        });
        if (productIds.length) {
          await tx.product.updateMany({
            where: { id: { in: productIds }, delFlag: 0 },
            data: { policyId: id, updatedDate: new Date() }
          });
        }
      }

      return policy;
    });
  }

  async softDeletePolicy(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { policyId: id, delFlag: 0 },
        data: { policyId: null, updatedDate: new Date() }
      });
      return tx.policy.update({
        where: { id },
        data: { delFlag: 1, updatedDate: new Date() }
      });
    });
  }

  createBanner(body: AdminBannerDto) {
    return this.prisma.banner.create({
      data: {
        id: randomUUID(),
        title: String(body.title ?? ''),
        imageUrl: String(body.imageUrl ?? ''),
        linkUrl: body.linkUrl ? String(body.linkUrl) : null,
        position: body.position ? String(body.position) : null,
        isActive: Number(body.isActive ?? 1),
        delFlag: 0,
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
  }

  updateBanner(id: string, body: UpdateAdminBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: String(body.title) } : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: String(body.imageUrl) } : {}),
        ...(body.linkUrl !== undefined
          ? { linkUrl: body.linkUrl ? String(body.linkUrl) : null }
          : {}),
        ...(body.position !== undefined
          ? { position: body.position ? String(body.position) : null }
          : {}),
        ...(body.isActive !== undefined ? { isActive: Number(body.isActive) } : {}),
        updatedDate: new Date()
      }
    });
  }

  softDeleteBanner(id: string) {
    return this.prisma.banner.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() }
    });
  }

  createSlider(body: AdminSliderDto) {
    return this.prisma.slider.create({
      data: {
        id: randomUUID(),
        title: String(body.title ?? ''),
        description: body.description ? String(body.description) : null,
        imageUrl: String(body.imageUrl ?? ''),
        linkUrl: body.linkUrl ? String(body.linkUrl) : null,
        position: Number(body.position ?? 1),
        isActive: Boolean(Number(body.isActive ?? 1)),
        delFlag: 0,
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
  }

  updateSlider(id: string, body: UpdateAdminSliderDto) {
    return this.prisma.slider.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: String(body.title) } : {}),
        ...(body.description !== undefined
          ? { description: body.description ? String(body.description) : null }
          : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: String(body.imageUrl) } : {}),
        ...(body.linkUrl !== undefined
          ? { linkUrl: body.linkUrl ? String(body.linkUrl) : null }
          : {}),
        ...(body.position !== undefined ? { position: Number(body.position) } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(Number(body.isActive)) } : {}),
        updatedDate: new Date()
      }
    });
  }

  softDeleteSlider(id: string) {
    return this.prisma.slider.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() }
    });
  }

  createNews(body: AdminNewsDto) {
    return this.prisma.news.create({
      data: {
        id: randomUUID(),
        title: String(body.title ?? ''),
        slug: String(body.slug ?? ''),
        summary: body.summary ? String(body.summary) : null,
        content: String(body.content ?? ''),
        thumbnail: body.thumbnail ? String(body.thumbnail) : null,
        categoryId: body.categoryId ? String(body.categoryId) : null,
        brandId: body.brandId ? String(body.brandId) : null,
        status: body.status ? String(body.status) : 'DRAFT',
        postType: body.postType ? String(body.postType) : 'NEWS',
        delFlag: 0,
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
  }

  updateNews(id: string, body: UpdateAdminNewsDto) {
    return this.prisma.news.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: String(body.title) } : {}),
        ...(body.slug !== undefined ? { slug: String(body.slug) } : {}),
        ...(body.summary !== undefined
          ? { summary: body.summary ? String(body.summary) : null }
          : {}),
        ...(body.content !== undefined ? { content: String(body.content) } : {}),
        ...(body.thumbnail !== undefined
          ? { thumbnail: body.thumbnail ? String(body.thumbnail) : null }
          : {}),
        ...(body.categoryId !== undefined
          ? { categoryId: body.categoryId ? String(body.categoryId) : null }
          : {}),
        ...(body.brandId !== undefined
          ? { brandId: body.brandId ? String(body.brandId) : null }
          : {}),
        ...(body.status !== undefined ? { status: String(body.status) } : {}),
        ...(body.postType !== undefined ? { postType: String(body.postType) } : {}),
        updatedDate: new Date()
      }
    });
  }

  softDeleteNews(id: string) {
    return this.prisma.news.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() }
    });
  }

  updateContact(id: string, body: AdminContactStatusDto) {
    return this.prisma.contact.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: String(body.status) } : {}),
        ...(body.note !== undefined ? { note: body.note ? String(body.note) : null } : {}),
        updatedDate: new Date()
      }
    });
  }

  softDeleteContact(id: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() }
    });
  }

  users() {
    return this.prisma.user.findMany({
      where: { delFlag: 0 },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdDate: true,
        updatedDate: true
      },
      orderBy: { createdDate: 'desc' },
      take: 100
    });
  }

  async createUser(body: AdminUserDto) {
    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '').trim();
    const password = String(body.password ?? '');
    if (!username || !email || !password)
      throw new BadRequestException('Username, email and password are required');

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        id: randomUUID(),
        username,
        email,
        password: hashedPassword,
        fullName: body.fullName ? String(body.fullName) : null,
        phone: body.phone ? String(body.phone) : null,
        role: Number(body.role ?? 1),
        delFlag: 0,
        createdDate: new Date(),
        updatedDate: new Date()
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdDate: true,
        updatedDate: true
      }
    });
  }

  updateUser(id: string, body: UpdateAdminUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(body.username !== undefined ? { username: String(body.username).trim() } : {}),
        ...(body.email !== undefined ? { email: String(body.email).trim() } : {}),
        ...(body.fullName !== undefined
          ? { fullName: body.fullName ? String(body.fullName) : null }
          : {}),
        ...(body.phone !== undefined ? { phone: body.phone ? String(body.phone) : null } : {}),
        ...(body.role !== undefined ? { role: Number(body.role) } : {}),
        updatedDate: new Date()
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdDate: true,
        updatedDate: true
      }
    });
  }

  async updateUserPassword(id: string, password?: string) {
    if (!password || password.length < 6)
      throw new BadRequestException('Password must have at least 6 characters');
    return this.prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(password, 10), updatedDate: new Date() },
      select: { id: true, username: true, email: true, role: true, updatedDate: true }
    });
  }

  softDeleteUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { delFlag: 1, updatedDate: new Date() },
      select: { id: true, username: true, email: true, role: true, updatedDate: true }
    });
  }

  settings() {
    return this.prisma.sysParam
      .findMany({
        where: { delFlag: 0 },
        orderBy: [{ groupCode: 'asc' }, { paramKey: 'asc' }],
        take: 200
      })
      .then((items) => items.map((item) => ({ ...item, id: item.id.toString() })));
  }

  async upsertSetting(body: AdminSettingDto) {
    const key = String(body.paramKey ?? '').trim();
    const value = String(body.paramValue ?? '');
    const name = String(body.paramName ?? key).trim();
    if (!key || !name) throw new BadRequestException('Setting key and name are required');

    const item = await this.prisma.sysParam.upsert({
      where: { paramKey: key },
      update: {
        paramValue: value,
        paramName: name,
        groupCode: body.groupCode ? String(body.groupCode) : null,
        description: body.description ? String(body.description) : null,
        delFlag: 0,
        updatedDate: new Date()
      },
      create: {
        paramKey: key,
        paramValue: value,
        paramName: name,
        groupCode: body.groupCode ? String(body.groupCode) : null,
        description: body.description ? String(body.description) : null,
        delFlag: 0,
        createdDate: new Date(),
        updatedDate: new Date()
      }
    });
    return { ...item, id: item.id.toString() };
  }

  async softDeleteSetting(id: string) {
    const item = await this.prisma.sysParam.update({
      where: { id: BigInt(id) },
      data: { delFlag: 1, updatedDate: new Date() }
    });
    return { ...item, id: item.id.toString() };
  }
}

function normalizeImages(images?: string[]) {
  return Array.from(new Set((images ?? []).map((item) => String(item).trim()).filter(Boolean)));
}

function normalizeIds(ids?: string[]) {
  return Array.from(new Set((ids ?? []).map((item) => String(item).trim()).filter(Boolean)));
}

function normalizeJsonList(items?: unknown[]) {
  return (items ?? [])
    .map((item) => String(item).trim())
    .filter(Boolean) as Prisma.InputJsonValue;
}
