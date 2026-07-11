import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true, index: true })
  siteId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ default: 0, min: 0 })
  price!: number;

  @Prop({ default: '', trim: true })
  imageUrl!: string;

  @Prop({ default: '' })
  imageMimeType!: string;

  @Prop({ type: Buffer, select: false })
  imageData?: Buffer;
}

export type ProductDocument = Product & Document;

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ siteId: 1, title: 'text', description: 'text' });
