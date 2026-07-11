import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Store {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Site', required: true, index: true, unique: true })
  siteId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Page' })
  productsPageId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Page' })
  cartPageId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ required: true, trim: true, default: 'store' })
  templateKey!: string;
}

export type StoreDocument = Store & Document;

export const StoreSchema = SchemaFactory.createForClass(Store);
