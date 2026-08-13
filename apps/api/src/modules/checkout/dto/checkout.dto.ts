import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEmail,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from 'class-validator';

export class CheckoutItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CheckoutDto {
  @IsString()
  customerName!: string;

  @IsString()
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsString()
  shippingAddress!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  @IsIn(['COD', 'BANK_TRANSFER', 'installment'])
  paymentMethod = 'COD';

  @IsOptional()
  @IsInt()
  @IsIn([3, 6, 9, 12])
  installmentTerm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9_999_999_999_999)
  installmentDownPayment?: number;

  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  @ArrayMinSize(1)
  items!: CheckoutItemDto[];
}
