import { ConflictException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { getTemplateSections } from '../common/templates/starter-templates';
import { normalizePageRoot } from '../common/utils/normalize-page';
import { PageElement } from '../common/types/page.types';
import { PageVersionsService } from '../page-versions/page-versions.service';
import { SitesService } from '../sites/sites.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page, PageDocument } from './pages.schema';

@Injectable()
export class PagesService implements OnModuleInit {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    private readonly sitesService: SitesService,
    private readonly pageVersionsService: PageVersionsService,
  ) {}

  async onModuleInit() {
    await this.dropLegacyPathIndex();
  }

  private async dropLegacyPathIndex() {
    try {
      await this.pageModel.collection.dropIndex('siteId_1_path_1');
      this.logger.log('Dropped legacy pages index siteId_1_path_1');
    } catch (err: any) {
      const code = err?.code;
      const message = String(err?.message ?? '');
      if (code === 27 || code === 26 || message.includes('index not found')) return;
      this.logger.warn(`Could not drop legacy pages index siteId_1_path_1: ${message}`);
    }
  }

  async create(siteId: string, ownerUserId: string, dto: CreatePageDto, retried = false) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const root = getTemplateSections(dto.templateId);
    const slug = dto.slug.toLowerCase();
    const title = dto.title ?? 'Home';

    try {
      const created = await this.pageModel.create({
        siteId: new Types.ObjectId(siteId),
        slug,
        title,
        root,
        isHome: slug === 'home',
        version: 1,
      });
      await this.pageVersionsService.createSnapshot(created._id.toString(), root, 1);

      if (dto.addToNav && slug !== 'home') {
        await this.sitesService.addPageNavLink(siteId, {
          label: dto.navLabel?.trim() || title,
          pageSlug: slug,
        });
      }

      return this.toDocument(created);
    } catch (err: any) {
      if (err?.code === 11000) {
        const existing = await this.findBySlugIfExists(siteId, slug);
        if (existing) return existing;

        const keyPattern = err?.keyPattern ?? {};
        if (!retried && 'path' in keyPattern) {
          await this.dropLegacyPathIndex();
          return this.create(siteId, ownerUserId, dto, true);
        }

        throw new ConflictException('Page slug already exists for this site');
      }
      throw err;
    }
  }

  async findOrCreate(siteId: string, ownerUserId: string, dto: CreatePageDto) {
    const slug = dto.slug.toLowerCase();
    const existing = await this.findBySlugIfExists(siteId, slug);
    if (existing) return existing;
    return this.create(siteId, ownerUserId, dto);
  }

  async findProductsPage(siteId: string) {
    for (const slug of ['shop', 'products', 'store'] as const) {
      const page = await this.findBySlugIfExists(siteId, slug);
      if (page) return page;
    }

    const pages = await this.pageModel.find({ siteId: new Types.ObjectId(siteId) }).exec();
    for (const page of pages) {
      if (this.rootHasProductGrid(page.root)) {
        return this.toDocument(page);
      }
    }
    return null;
  }

  async findCartPage(siteId: string) {
    const bySlug = await this.findBySlugIfExists(siteId, 'cart');
    if (bySlug) return bySlug;

    const pages = await this.pageModel.find({ siteId: new Types.ObjectId(siteId) }).exec();
    for (const page of pages) {
      if (this.rootHasCartElements(page.root as PageElement[])) {
        return this.toDocument(page);
      }
    }
    return null;
  }

  private rootHasProductGrid(elements: PageElement[]): boolean {
    for (const el of elements) {
      if (el.type === 'productGrid') return true;
      if (el.children?.length && this.rootHasProductGrid(el.children)) return true;
    }
    return false;
  }

  private rootHasCartElements(elements: PageElement[]): boolean {
    for (const el of elements) {
      if (el.type === 'cartList' || el.type === 'cartSummary') return true;
      if (el.children?.length && this.rootHasCartElements(el.children)) return true;
    }
    return false;
  }

  async findBySlug(siteId: string, ownerUserId: string, slug: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const page = await this.pageModel
      .findOne({ siteId: new Types.ObjectId(siteId), slug: slug.toLowerCase() })
      .exec();
    if (!page) throw new NotFoundException('Page not found');
    return this.toDocument(page);
  }

  async findBySlugIfExists(siteId: string, slug: string) {
    const page = await this.pageModel
      .findOne({ siteId: new Types.ObjectId(siteId), slug: slug.toLowerCase() })
      .exec();
    return page ? this.toDocument(page) : null;
  }

  async findById(siteId: string, pageId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const page = await this.pageModel
      .findOne({ _id: new Types.ObjectId(pageId), siteId: new Types.ObjectId(siteId) })
      .exec();
    if (!page) throw new NotFoundException('Page not found');
    return this.toDocument(page);
  }

  async update(siteId: string, pageId: string, ownerUserId: string, dto: UpdatePageDto) {
    const page = await this.pageModel
      .findOne({ _id: new Types.ObjectId(pageId), siteId: new Types.ObjectId(siteId) })
      .exec();
    if (!page) throw new NotFoundException('Page not found');
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);

    if (dto.version && dto.version !== page.version) {
      throw new ConflictException('Version conflict — reload the page');
    }

    page.root = dto.root as PageElement[];
    page.version += 1;
    await page.save();
    await this.pageVersionsService.createSnapshot(page._id.toString(), page.root, page.version);
    return this.toDocument(page);
  }

  async getHomePageForPublishedSite(siteId: Types.ObjectId) {
    const page =
      (await this.pageModel.findOne({ siteId, isHome: true }).exec()) ??
      (await this.pageModel.findOne({ siteId }).sort({ createdAt: 1 }).exec());
    return page;
  }

  async getPublishedPageBySlug(siteId: Types.ObjectId, pageSlug: string) {
    const normalized = pageSlug.toLowerCase();
    const page = await this.pageModel
      .findOne({ siteId, slug: normalized })
      .exec();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async listForSite(siteId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const pages = await this.pageModel
      .find({ siteId: new Types.ObjectId(siteId) })
      .select('slug title isHome')
      .lean()
      .sort({ isHome: -1, createdAt: 1 })
      .exec();

    return pages.map((page) => ({
      id: page._id.toString(),
      slug: page.slug,
      title: page.title,
      isHome: Boolean(page.isHome),
    }));
  }

  toDocument(page: PageDocument) {
    return {
      id: page._id.toString(),
      siteId: page.siteId.toString(),
      slug: page.slug,
      title: page.title,
      root: normalizePageRoot(page.root),
      seo: page.seo,
      version: page.version,
      updatedAt: (page as any).updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
