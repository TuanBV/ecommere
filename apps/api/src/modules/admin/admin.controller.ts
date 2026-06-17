import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, isAbsolute, join } from 'node:path';
import { ok } from '../../common/api-response';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import {
  AdminBannerDto,
  AdminContactStatusDto,
  AdminOrderStatusDto,
  AdminNewsDto,
  AdminProductDto,
  AdminSettingDto,
  AdminSliderDto,
  AdminUserDto,
  UpdateAdminBannerDto,
  UpdateAdminNewsDto,
  UpdateAdminProductDto,
  UpdateAdminSliderDto,
  UpdateAdminUserDto,
  UpdateAdminUserPasswordDto,
} from './dto/admin.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  async dashboard() {
    return ok(await this.admin.dashboard());
  }

  @Get('products')
  async products(@Query('q') q?: string) {
    return ok(await this.admin.products(q));
  }

  @Post('products')
  async createProduct(@Body() body: AdminProductDto) {
    return ok(await this.admin.createProduct(body));
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: UpdateAdminProductDto) {
    return ok(await this.admin.updateProduct(id, body));
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return ok(await this.admin.softDeleteProduct(id));
  }

  @Post('uploads/product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';
          const root = isAbsolute(uploadDir) ? uploadDir : join(process.cwd(), uploadDir);
          const destination = join(root, 'products');
          mkdirSync(destination, { recursive: true });
          callback(null, destination);
        },
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase() || '.webp';
          callback(null, `${randomUUID()}${extension}`);
        }
      }),
      fileFilter: (_req, file, callback) => {
        if (!/^image\/(avif|gif|jpe?g|png|webp)$/i.test(file.mimetype)) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  )
  async uploadProductImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file is required');
    return ok({ url: `/uploads/products/${file.filename}` });
  }

  @Get('orders')
  async orders() {
    return ok(await this.admin.orders());
  }

  @Get('orders/:id')
  async order(@Param('id') id: string) {
    return ok(await this.admin.order(id));
  }

  @Patch('orders/:id/status')
  async orderStatus(@Param('id') id: string, @Body() body: AdminOrderStatusDto) {
    return ok(await this.admin.updateOrderStatus(id, body.status, body.adminNote));
  }

  @Get('categories')
  async categories() {
    return ok(await this.admin.table('category'));
  }

  @Get('brands')
  async brands() {
    return ok(await this.admin.table('brand'));
  }

  @Get('reviews')
  async reviews() {
    return ok(await this.admin.table('review'));
  }

  @Get('banners')
  async banners() {
    return ok(await this.admin.table('banner'));
  }

  @Post('banners')
  async createBanner(@Body() body: AdminBannerDto) {
    return ok(await this.admin.createBanner(body));
  }

  @Patch('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() body: UpdateAdminBannerDto) {
    return ok(await this.admin.updateBanner(id, body));
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    return ok(await this.admin.softDeleteBanner(id));
  }

  @Get('sliders')
  async sliders() {
    return ok(await this.admin.table('slider'));
  }

  @Post('sliders')
  async createSlider(@Body() body: AdminSliderDto) {
    return ok(await this.admin.createSlider(body));
  }

  @Patch('sliders/:id')
  async updateSlider(@Param('id') id: string, @Body() body: UpdateAdminSliderDto) {
    return ok(await this.admin.updateSlider(id, body));
  }

  @Delete('sliders/:id')
  async deleteSlider(@Param('id') id: string) {
    return ok(await this.admin.softDeleteSlider(id));
  }

  @Get('news')
  async news() {
    return ok(await this.admin.table('news'));
  }

  @Post('news')
  async createNews(@Body() body: AdminNewsDto) {
    return ok(await this.admin.createNews(body));
  }

  @Patch('news/:id')
  async updateNews(@Param('id') id: string, @Body() body: UpdateAdminNewsDto) {
    return ok(await this.admin.updateNews(id, body));
  }

  @Delete('news/:id')
  async deleteNews(@Param('id') id: string) {
    return ok(await this.admin.softDeleteNews(id));
  }

  @Get('contacts')
  async contacts() {
    return ok(await this.admin.table('contact'));
  }

  @Patch('contacts/:id')
  async updateContact(@Param('id') id: string, @Body() body: AdminContactStatusDto) {
    return ok(await this.admin.updateContact(id, body));
  }

  @Delete('contacts/:id')
  async deleteContact(@Param('id') id: string) {
    return ok(await this.admin.softDeleteContact(id));
  }

  @Get('users')
  async users() {
    return ok(await this.admin.users());
  }

  @Post('users')
  async createUser(@Body() body: AdminUserDto) {
    return ok(await this.admin.createUser(body));
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateAdminUserDto) {
    return ok(await this.admin.updateUser(id, body));
  }

  @Patch('users/:id/password')
  async updateUserPassword(@Param('id') id: string, @Body() body: UpdateAdminUserPasswordDto) {
    return ok(await this.admin.updateUserPassword(id, body.password));
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return ok(await this.admin.softDeleteUser(id));
  }

  @Get('settings')
  async settings() {
    return ok(await this.admin.settings());
  }

  @Post('settings')
  async upsertSetting(@Body() body: AdminSettingDto) {
    return ok(await this.admin.upsertSetting(body));
  }

  @Delete('settings/:id')
  async deleteSetting(@Param('id') id: string) {
    return ok(await this.admin.softDeleteSetting(id));
  }
}
