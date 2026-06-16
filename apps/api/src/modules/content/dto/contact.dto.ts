import { IsOptional, IsString } from 'class-validator';

export class ContactDto {
  @IsString()
  fullName!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
