import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ok } from '../../common/api-response';
import { ContactDto } from './dto/contact.dto';
import { ReviewDto } from './dto/review.dto';
import { ContentService } from './content.service';

@ApiTags('content')
@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('banners')
  async banners(@Query('position') position?: string) {
    return ok(await this.content.banners(position));
  }

  @Get('sliders')
  async sliders() {
    return ok(await this.content.sliders());
  }

  @Get('news')
  async news(@Query('page') page?: string, @Query('limit') limit?: string, @Query('q') q?: string) {
    const result = await this.content.news({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      q
    });
    return ok(result.items, result.meta);
  }

  @Get('news/:slug')
  async newsDetail(@Param('slug') slug: string) {
    return ok(await this.content.newsDetail(slug));
  }

  @Post('reviews')
  async review(@Body() dto: ReviewDto) {
    return ok(await this.content.createReview(dto));
  }

  @Post('contact')
  async contact(@Body() dto: ContactDto) {
    return ok(await this.content.createContact(dto));
  }
}
