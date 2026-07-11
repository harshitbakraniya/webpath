import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;
}
