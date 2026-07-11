import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PageElement } from '../common/types/page.types';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PageVersion {
  @Prop({ type: Types.ObjectId, ref: 'Page', required: true, index: true })
  pageId!: Types.ObjectId;

  @Prop({ type: Array, required: true })
  snapshot!: PageElement[];

  @Prop({ required: true })
  version!: number;
}

export type PageVersionDocument = PageVersion & Document;
export const PageVersionSchema = SchemaFactory.createForClass(PageVersion);
