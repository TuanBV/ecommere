import { Injectable } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';
import { ReviewDto } from './dto/review.dto';
import { ContentRepository } from './content.repo';

@Injectable()
export class ContentService {
  constructor(private readonly contentRepository: ContentRepository) {}

  banners(position?: string) {
    return this.contentRepository.banners(position);
  }

  sliders() {
    return this.contentRepository.sliders();
  }

  news() {
    return this.contentRepository.news();
  }

  newsDetail(slug: string) {
    return this.contentRepository.newsDetail(slug);
  }

  createReview(dto: ReviewDto) {
    return this.contentRepository.createReview(dto);
  }

  createContact(dto: ContactDto) {
    return this.contentRepository.createContact(dto);
  }
}
