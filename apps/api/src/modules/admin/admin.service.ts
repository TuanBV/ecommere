import { Injectable } from '@nestjs/common';
import { CATALOG_CACHE_PREFIX } from '../catalog/catalog.service';
import { RedisService } from '../../redis/redis.service';
import { AdminRepository } from './admin.repo';
import {
  AdminBannerDto,
  AdminContactStatusDto,
  AdminFacebookPostDto,
  AdminOrderStatusDto,
  AdminNewsDto,
  AdminPolicyDto,
  AdminProductDto,
  AdminSettingDto,
  AdminSliderDto,
  AdminTaxonomyDto,
  AdminUserDto,
  UpdateAdminBannerDto,
  UpdateAdminFacebookPostDto,
  UpdateAdminNewsDto,
  UpdateAdminPolicyDto,
  UpdateAdminProductDto,
  UpdateAdminSliderDto,
  UpdateAdminTaxonomyDto,
  UpdateAdminUserDto
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly redis: RedisService
  ) {}

  private invalidateCatalogCache() {
    return this.redis.delByPrefix(CATALOG_CACHE_PREFIX);
  }

  dashboard() {
    return this.adminRepository.dashboard();
  }
  products(q?: string) {
    return this.adminRepository.products(q);
  }
  async createProduct(body: AdminProductDto) {
    const result = await this.adminRepository.createProduct(body);
    await this.invalidateCatalogCache();
    return result;
  }
  async updateProduct(id: string, body: UpdateAdminProductDto) {
    const result = await this.adminRepository.updateProduct(id, body);
    await this.invalidateCatalogCache();
    return result;
  }
  async softDeleteProduct(id: string) {
    const result = await this.adminRepository.softDeleteProduct(id);
    await this.invalidateCatalogCache();
    return result;
  }
  async createCategory(body: AdminTaxonomyDto) {
    const result = await this.adminRepository.createCategory(body);
    await this.invalidateCatalogCache();
    return result;
  }
  async updateCategory(id: string, body: UpdateAdminTaxonomyDto) {
    const result = await this.adminRepository.updateCategory(id, body);
    await this.invalidateCatalogCache();
    return result;
  }
  async softDeleteCategory(id: string) {
    const result = await this.adminRepository.softDeleteCategory(id);
    await this.invalidateCatalogCache();
    return result;
  }
  async createBrand(body: AdminTaxonomyDto) {
    const result = await this.adminRepository.createBrand(body);
    await this.invalidateCatalogCache();
    return result;
  }
  async updateBrand(id: string, body: UpdateAdminTaxonomyDto) {
    const result = await this.adminRepository.updateBrand(id, body);
    await this.invalidateCatalogCache();
    return result;
  }
  async softDeleteBrand(id: string) {
    const result = await this.adminRepository.softDeleteBrand(id);
    await this.invalidateCatalogCache();
    return result;
  }
  orders() {
    return this.adminRepository.orders();
  }
  order(id: string) {
    return this.adminRepository.order(id);
  }
  updateOrderStatus(id: string, status: string, adminNote?: string) {
    return this.adminRepository.updateOrderStatus(id, status, adminNote);
  }
  table(table: Parameters<AdminRepository['table']>[0]) {
    return this.adminRepository.table(table);
  }
  createBanner(body: AdminBannerDto) {
    return this.adminRepository.createBanner(body);
  }
  updateBanner(id: string, body: UpdateAdminBannerDto) {
    return this.adminRepository.updateBanner(id, body);
  }
  softDeleteBanner(id: string) {
    return this.adminRepository.softDeleteBanner(id);
  }
  createSlider(body: AdminSliderDto) {
    return this.adminRepository.createSlider(body);
  }
  updateSlider(id: string, body: UpdateAdminSliderDto) {
    return this.adminRepository.updateSlider(id, body);
  }
  softDeleteSlider(id: string) {
    return this.adminRepository.softDeleteSlider(id);
  }
  createNews(body: AdminNewsDto) {
    return this.adminRepository.createNews(body);
  }
  updateNews(id: string, body: UpdateAdminNewsDto) {
    return this.adminRepository.updateNews(id, body);
  }
  softDeleteNews(id: string) {
    return this.adminRepository.softDeleteNews(id);
  }
  facebookPosts() {
    return this.adminRepository.facebookPosts();
  }
  createFacebookPost(body: AdminFacebookPostDto) {
    return this.adminRepository.createFacebookPost(body);
  }
  updateFacebookPost(id: string, body: UpdateAdminFacebookPostDto) {
    return this.adminRepository.updateFacebookPost(id, body);
  }
  deleteFacebookPost(id: string) {
    return this.adminRepository.deleteFacebookPost(id);
  }
  createPolicy(body: AdminPolicyDto) {
    return this.adminRepository.createPolicy(body);
  }
  updatePolicy(id: string, body: UpdateAdminPolicyDto) {
    return this.adminRepository.updatePolicy(id, body);
  }
  softDeletePolicy(id: string) {
    return this.adminRepository.softDeletePolicy(id);
  }
  updateContact(id: string, body: AdminContactStatusDto) {
    return this.adminRepository.updateContact(id, body);
  }
  softDeleteContact(id: string) {
    return this.adminRepository.softDeleteContact(id);
  }
  users() {
    return this.adminRepository.users();
  }
  createUser(body: AdminUserDto) {
    return this.adminRepository.createUser(body);
  }
  updateUser(id: string, body: UpdateAdminUserDto) {
    return this.adminRepository.updateUser(id, body);
  }
  updateUserPassword(id: string, password?: string) {
    return this.adminRepository.updateUserPassword(id, password);
  }
  softDeleteUser(id: string) {
    return this.adminRepository.softDeleteUser(id);
  }
  settings() {
    return this.adminRepository.settings();
  }
  upsertSetting(body: AdminSettingDto) {
    return this.adminRepository.upsertSetting(body);
  }
  softDeleteSetting(id: string) {
    return this.adminRepository.softDeleteSetting(id);
  }
}
