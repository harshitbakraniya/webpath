import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateStoreDto } from './dto/create-store.dto';
import { Store, StoreDocument } from './stores.schema';

export const TEMPLATE_KEYS = ['basic', 'modern', 'minimal'] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class StoresService {
  constructor(@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>) {}

  async findMyStore(ownerUserId: string) {
    return this.storeModel.findOne({ ownerUserId: new Types.ObjectId(ownerUserId) }).exec();
  }

  async createMyStore(ownerUserId: string, dto: CreateStoreDto) {
    if (!dto.siteId) {
      throw new BadRequestException('siteId is required');
    }

    const existing = await this.storeModel
      .findOne({ siteId: new Types.ObjectId(dto.siteId) })
      .exec();
    if (existing) throw new ConflictException('Store already exists for this site');

    const templateKey = dto.templateKey as TemplateKey;
    if (!TEMPLATE_KEYS.includes(templateKey)) {
      throw new BadRequestException(`Invalid templateKey. Allowed: ${TEMPLATE_KEYS.join(', ')}`);
    }

    const slug = slugify(dto.name);
    if (!slug) throw new BadRequestException('Store name is invalid');

    const created = await this.storeModel.create({
      ownerUserId: new Types.ObjectId(ownerUserId),
      siteId: new Types.ObjectId(dto.siteId),
      name: dto.name.trim(),
      slug,
      templateKey,
    });

    return created;
  }
}

