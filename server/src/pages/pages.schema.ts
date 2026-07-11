import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PageElement } from '../common/types/page.types';

@Schema({ timestamps: true })
export class Page {
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true, index: true })
  siteId!: Types.ObjectId;

  @Prop({ required: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: Array, default: [] })
  root!: PageElement[];

  @Prop({ type: Object, default: {} })
  seo!: Record<string, unknown>;

  @Prop({ default: 1 })
  version!: number;

  @Prop({ default: false })
  isHome!: boolean;
}

export type PageDocument = Page & Document;
export const PageSchema = SchemaFactory.createForClass(Page);
PageSchema.index({ siteId: 1, slug: 1 }, { unique: true });
