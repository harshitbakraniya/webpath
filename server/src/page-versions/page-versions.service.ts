import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PageElement } from '../common/types/page.types';
import { PageVersion, PageVersionDocument } from './page-versions.schema';

@Injectable()
export class PageVersionsService {
  constructor(@InjectModel(PageVersion.name) private readonly versionModel: Model<PageVersionDocument>) {}

  async createSnapshot(pageId: string, snapshot: PageElement[], version: number) {
    await this.versionModel.create({
      pageId: new Types.ObjectId(pageId),
      snapshot,
      version,
    });
    // Keep last 20 versions
    const versions = await this.versionModel
      .find({ pageId: new Types.ObjectId(pageId) })
      .select('version')
      .sort({ version: -1 })
      .lean()
      .exec();
    if (versions.length > 20) {
      const toDelete = versions.slice(20).map((v) => v._id);
      await this.versionModel.deleteMany({ _id: { $in: toDelete } });
    }
  }

  async list(pageId: string) {
    const versions = await this.versionModel
      .find({ pageId: new Types.ObjectId(pageId) })
      .select('version createdAt')
      .sort({ version: -1 })
      .limit(20)
      .lean()
      .exec();
    return versions.map((v) => ({
      id: v._id.toString(),
      version: v.version,
      createdAt: (v as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    }));
  }

  async getSnapshot(versionId: string) {
    const v = await this.versionModel.findById(versionId).exec();
    if (!v) throw new NotFoundException('Version not found');
    return { snapshot: v.snapshot, version: v.version };
  }
}
