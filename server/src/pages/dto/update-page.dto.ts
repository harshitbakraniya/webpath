import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { PageElement } from '../../common/types/page.types';

export class UpdatePageDto {
  @IsArray()
  root!: PageElement[];

  @IsOptional()
  @IsNumber()
  version?: number;
}
