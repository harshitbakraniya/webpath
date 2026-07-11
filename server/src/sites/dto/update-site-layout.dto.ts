import { IsOptional } from 'class-validator';
import type { PageElement } from '../../common/types/page.types';

export class UpdateSiteLayoutDto {
  @IsOptional()
  header?: PageElement[];

  @IsOptional()
  footer?: PageElement[];
}
