import { Injectable } from '@nestjs/common';
import { CatalogRepository } from './catalog.repo';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  findProducts(query: ProductQueryDto) {
    return this.catalogRepository.findProducts(query);
  }

  findProductBySlug(slug: string) {
    return this.catalogRepository.findProductBySlug(slug);
  }

  findProductImages(productId: string) {
    return this.catalogRepository.findProductImages(productId);
  }

  findCategories() {
    return this.catalogRepository.findCategories();
  }

  findBrands() {
    return this.catalogRepository.findBrands();
  }
}
