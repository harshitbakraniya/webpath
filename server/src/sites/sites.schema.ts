import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { SiteLayout } from '../common/types/page.types';

@Schema({ timestamps: true })
export class Site {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true, lowercase: true, sparse: true, unique: true })
  domain?: string;

  @Prop({ required: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ default: 'draft', enum: ['draft', 'published'] })
  status!: 'draft' | 'published';

  @Prop({ type: Object, default: null })
  publishedSnapshot?: Record<string, unknown>;

  @Prop({ type: Object, default: () => ({ header: [], footer: [] }) })
  layout?: SiteLayout;
}

export type SiteDocument = Site & Document;
export const SiteSchema = SchemaFactory.createForClass(Site);

// Slug unique per user (not globally — multiple users can have "my-store")
SiteSchema.index({ ownerUserId: 1, slug: 1 }, { unique: true });
