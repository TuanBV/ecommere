import { IsEmail, IsInt, IsString, Max, Min } from 'class-validator';

export class ReviewDto {
  @IsString()
  productId!: string;

  @IsString()
  reviewName!: string;

  @IsEmail()
  reviewEmail!: string;

  @IsString()
  content!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
