import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsIn([
    'business',
    'store',
    'products',
    'cart',
    'about',
    'services',
    'contact',
    'blank',
    'blog',
    'appointments',
    'projects',
    'privacy',
    'refund',
    'terms',
  ])
  templateId!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  addToNav?: boolean;

  @IsOptional()
  @IsString()
  navLabel?: string;
}
