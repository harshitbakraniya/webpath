import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SitesService } from '../sites/sites.service';
import { Category, CategoryDocument } from './categories.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    private readonly sitesService: SitesService,
  ) {}

  async list(siteId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const items = await this.categoryModel
      .find({ siteId: new Types.ObjectId(siteId) })
      .sort({ name: 1 })
      .exec();
    return items.map((c) => ({
      id: c._id.toString(),
      siteId: c.siteId.toString(),
      name: c.name,
      slug: c.slug,
    }));
  }
}
