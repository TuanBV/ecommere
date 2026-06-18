import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsObject,
  IsString,
  Min
} from 'class-validator';

export class AdminProductDto {
  @IsString()
  title!: string;

  @IsString()
  sku!: string;

  @IsString()
  slug!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  brandId!: string;

  @Type(() => Number)
  @Min(0)
  price = 0;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  salePrice = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQty = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status = 1;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  specification?: string;

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  policyId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedProductIds?: string[];
}

export class UpdateAdminProductDto extends PartialType(AdminProductDto) {}

export class AdminBannerDto {
  @IsString()
  title!: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isActive = 1;
}

export class UpdateAdminBannerDto extends PartialType(AdminBannerDto) {}

export class AdminSliderDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position = 1;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive = true;
}

export class UpdateAdminSliderDto extends PartialType(AdminSliderDto) {}

export class AdminNewsDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  status = 'DRAFT';

  @IsOptional()
  @IsString()
  postType = 'NEWS';
}

export class UpdateAdminNewsDto extends PartialType(AdminNewsDto) {}

export class AdminTaxonomyDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priority = 0;
}

export class UpdateAdminTaxonomyDto extends PartialType(AdminTaxonomyDto) {}

export class AdminPolicyDto {
  @IsString()
  packageName!: string;

  @IsOptional()
  @IsArray()
  policies?: string[];

  @IsOptional()
  @IsArray()
  afterSales?: string[];

  @IsOptional()
  @IsArray()
  gifts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @IsOptional()
  @IsObject()
  raw?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isActive = 1;
}

export class UpdateAdminPolicyDto extends PartialType(AdminPolicyDto) {}

export class AdminOrderStatusDto {
  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class AdminContactStatusDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminUserDto {
  @IsString()
  username!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  role = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status = 1;

  @IsString()
  password!: string;
}

export class UpdateAdminUserDto extends PartialType(AdminUserDto) {}

export class UpdateAdminUserPasswordDto {
  @IsString()
  password!: string;
}

export class AdminSettingDto {
  @IsString()
  paramKey!: string;

  @IsOptional()
  @IsString()
  paramValue?: string;

  @IsOptional()
  @IsString()
  paramName?: string;

  @IsOptional()
  @IsString()
  groupCode?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
