import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsNotEmpty()
  templateKey!: string;

  @IsOptional()
  @IsString()
  siteId?: string;
}

