import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { CatalogRepository } from './catalog.repo';
import { ProductQueryDto } from './dto/product-query.dto';

export const CATALOG_CACHE_PREFIX = 'catalog:';
const LIST_TTL_SECONDS = 60;
const DETAIL_TTL_SECONDS = 120;
const TAXONOMY_TTL_SECONDS = 300;

@Injectable()
export class CatalogService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly redis: RedisService
  ) {}

  findProducts(query: ProductQueryDto) {
    const key = `${CATALOG_CACHE_PREFIX}products:${JSON.stringify(query)}`;
    return this.redis.getOrSet(key, LIST_TTL_SECONDS, () =>
      this.catalogRepository.findProducts(query)
    );
  }

  findProductBySlug(slug: string) {
    const key = `${CATALOG_CACHE_PREFIX}product:${slug}`;
    return this.redis.getOrSet(key, DETAIL_TTL_SECONDS, () =>
      this.catalogRepository.findProductBySlug(slug)
    );
  }

  findProductImages(productId: string) {
    return this.catalogRepository.findProductImages(productId);
  }

  findCategories() {
    const key = `${CATALOG_CACHE_PREFIX}categories`;
    return this.redis.getOrSet(key, TAXONOMY_TTL_SECONDS, () =>
      this.catalogRepository.findCategories()
    );
  }

  findBrands() {
    const key = `${CATALOG_CACHE_PREFIX}brands`;
    return this.redis.getOrSet(key, TAXONOMY_TTL_SECONDS, () =>
      this.catalogRepository.findBrands()
    );
  }
}
