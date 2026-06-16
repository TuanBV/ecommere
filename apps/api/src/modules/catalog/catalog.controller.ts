import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ok } from '../../common/api-response';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('products')
  async products(@Query() query: ProductQueryDto) {
    const result = await this.catalog.findProducts(query);
    return ok(result.items, result.meta);
  }

  @Get('products/:slug')
  async product(@Param('slug') slug: string) {
    return ok(await this.catalog.findProductBySlug(slug));
  }

  @Get('products/:id/images')
  async productImages(@Param('id') id: string) {
    return ok(await this.catalog.findProductImages(id));
  }

  @Get('categories')
  async categories() {
    return ok(await this.catalog.findCategories());
  }

  @Get('brands')
  async brands() {
    return ok(await this.catalog.findBrands());
  }
}
