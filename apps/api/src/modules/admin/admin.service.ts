import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repo';
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
  UpdateAdminUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  dashboard() { return this.adminRepository.dashboard(); }
  products(q?: string) { return this.adminRepository.products(q); }
  createProduct(body: AdminProductDto) { return this.adminRepository.createProduct(body); }
  updateProduct(id: string, body: UpdateAdminProductDto) { return this.adminRepository.updateProduct(id, body); }
  softDeleteProduct(id: string) { return this.adminRepository.softDeleteProduct(id); }
  createCategory(body: AdminTaxonomyDto) { return this.adminRepository.createCategory(body); }
  updateCategory(id: string, body: UpdateAdminTaxonomyDto) { return this.adminRepository.updateCategory(id, body); }
  softDeleteCategory(id: string) { return this.adminRepository.softDeleteCategory(id); }
  createBrand(body: AdminTaxonomyDto) { return this.adminRepository.createBrand(body); }
  updateBrand(id: string, body: UpdateAdminTaxonomyDto) { return this.adminRepository.updateBrand(id, body); }
  softDeleteBrand(id: string) { return this.adminRepository.softDeleteBrand(id); }
  orders() { return this.adminRepository.orders(); }
  order(id: string) { return this.adminRepository.order(id); }
  updateOrderStatus(id: string, status: string, adminNote?: string) { return this.adminRepository.updateOrderStatus(id, status, adminNote); }
  table(table: Parameters<AdminRepository['table']>[0]) { return this.adminRepository.table(table); }
  createBanner(body: AdminBannerDto) { return this.adminRepository.createBanner(body); }
  updateBanner(id: string, body: UpdateAdminBannerDto) { return this.adminRepository.updateBanner(id, body); }
  softDeleteBanner(id: string) { return this.adminRepository.softDeleteBanner(id); }
  createSlider(body: AdminSliderDto) { return this.adminRepository.createSlider(body); }
  updateSlider(id: string, body: UpdateAdminSliderDto) { return this.adminRepository.updateSlider(id, body); }
  softDeleteSlider(id: string) { return this.adminRepository.softDeleteSlider(id); }
  createNews(body: AdminNewsDto) { return this.adminRepository.createNews(body); }
  updateNews(id: string, body: UpdateAdminNewsDto) { return this.adminRepository.updateNews(id, body); }
  softDeleteNews(id: string) { return this.adminRepository.softDeleteNews(id); }
  createPolicy(body: AdminPolicyDto) { return this.adminRepository.createPolicy(body); }
  updatePolicy(id: string, body: UpdateAdminPolicyDto) { return this.adminRepository.updatePolicy(id, body); }
  softDeletePolicy(id: string) { return this.adminRepository.softDeletePolicy(id); }
  updateContact(id: string, body: AdminContactStatusDto) { return this.adminRepository.updateContact(id, body); }
  softDeleteContact(id: string) { return this.adminRepository.softDeleteContact(id); }
  users() { return this.adminRepository.users(); }
  createUser(body: AdminUserDto) { return this.adminRepository.createUser(body); }
  updateUser(id: string, body: UpdateAdminUserDto) { return this.adminRepository.updateUser(id, body); }
  updateUserPassword(id: string, password?: string) { return this.adminRepository.updateUserPassword(id, password); }
  softDeleteUser(id: string) { return this.adminRepository.softDeleteUser(id); }
  settings() { return this.adminRepository.settings(); }
  upsertSetting(body: AdminSettingDto) { return this.adminRepository.upsertSetting(body); }
  softDeleteSetting(id: string) { return this.adminRepository.softDeleteSetting(id); }
}
