import { ConflictException, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { Page, PageDocument } from '../pages/pages.schema';
import { PageVersion, PageVersionDocument } from '../page-versions/page-versions.schema';
import { Product, ProductDocument } from '../products/products.schema';
import { Store, StoreDocument } from '../stores/stores.schema';
import { normalizePageRoot } from '../common/utils/normalize-page';
import { buildDefaultSiteLayout, layoutHasCartIcon, layoutHasShopLink, layoutIsEmpty, mergeCartIcon, mergePageNavLink, mergeShopNavLink } from '../common/templates/site-layout';
import type { PageElement, SiteLayout } from '../common/types/page.types';
import { Site, SiteDocument } from './sites.schema';
import { CreateSiteDto } from './dto/create-site.dto';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniqueSuffix() {
  return randomBytes(3).toString('hex');
}

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(PageVersion.name) private readonly pageVersionModel: Model<PageVersionDocument>,
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(ownerUserId: string, dto: CreateSiteDto) {
    const ownerId = new Types.ObjectId(ownerUserId);
    const baseSlug = slugify(dto.name) || 'site';
    let slug = `${baseSlug}-${uniqueSuffix()}`;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const created = await this.siteModel.create({
          ownerUserId: ownerId,
          name: dto.name.trim(),
          slug,
          status: 'draft',
          layout: buildDefaultSiteLayout(),
        });
        return this.toDto(created);
      } catch (err: any) {
        if (err?.code === 11000) {
          slug = `${baseSlug}-${uniqueSuffix()}`;
          continue;
        }
        throw err;
      }
    }

    throw new ConflictException('Could not create site — try again');
  }

  async findByIdForOwner(siteId: string, ownerUserId: string) {
    const site = await this.siteModel.findById(siteId).exec();
    if (!site) throw new NotFoundException('Site not found');
    if (site.ownerUserId.toString() !== ownerUserId) throw new ForbiddenException();
    return site;
  }

  async findBySlugPublic(slugOrDomain: string) {
    const normalized = slugOrDomain.toLowerCase();
    const site = await this.siteModel
      .findOne({
        $or: [{ slug: normalized }, { domain: normalized }],
        status: 'published',
      })
      .exec();
    if (!site) throw new NotFoundException('Published site not found');
    return site;
  }

  async publish(siteId: string, ownerUserId: string, snapshot: Record<string, unknown>) {
    const site = await this.findByIdForOwner(siteId, ownerUserId);
    site.status = 'published';
    site.publishedSnapshot = snapshot;
    await site.save();
    return this.toDto(site);
  }

  async getLayout(siteId: string, ownerUserId: string) {
    const site = await this.findByIdForOwner(siteId, ownerUserId);
    return this.syncSiteLayout(site);
  }

  async updateLayout(siteId: string, ownerUserId: string, patch: Partial<SiteLayout>) {
    const site = await this.findByIdForOwner(siteId, ownerUserId);
    const current = (site.layout as SiteLayout) ?? buildDefaultSiteLayout();
    site.layout = {
      header: patch.header ?? current.header,
      footer: patch.footer ?? current.footer,
    };
    await site.save();
    return site.layout as SiteLayout;
  }

  async getPublishedLayout(site: SiteDocument) {
    const shopPageSlug = await this.resolveShopPageSlug(site._id.toString());
    const cartPageSlug = await this.resolveCartPageSlug(site._id.toString());
    let layout = layoutIsEmpty(site.layout)
      ? buildDefaultSiteLayout({
          ...(shopPageSlug ? { shopPageSlug } : {}),
          ...(cartPageSlug ? { cartPageSlug } : {}),
        })
      : (site.layout as SiteLayout);

    if (shopPageSlug) {
      layout = mergeShopNavLink(layout, shopPageSlug);
    }
    if (cartPageSlug) {
      layout = mergeCartIcon(layout, cartPageSlug);
    }
    return layout;
  }

  async addShopNavLink(siteId: string, shopPageSlug: string) {
    const site = await this.siteModel.findById(siteId).exec();
    if (!site) return null;
    return this.syncSiteLayout(site, shopPageSlug);
  }

  async addCartIcon(siteId: string, cartPageSlug: string) {
    const site = await this.siteModel.findById(siteId).exec();
    if (!site) return null;
    return this.syncSiteLayout(site, undefined, cartPageSlug);
  }

  async addPageNavLink(siteId: string, options: { label: string; pageSlug: string }) {
    const site = await this.siteModel.findById(siteId).exec();
    if (!site) return null;

    let layout = layoutIsEmpty(site.layout)
      ? buildDefaultSiteLayout()
      : (site.layout as SiteLayout);

    layout = mergePageNavLink(layout, options);
    site.layout = layout;
    await site.save();
    return layout;
  }

  private async syncSiteLayout(
    site: SiteDocument,
    shopPageSlug?: string,
    cartPageSlug?: string,
  ): Promise<SiteLayout> {
    const slug = shopPageSlug ?? (await this.resolveShopPageSlug(site._id.toString()));
    const cartSlug = cartPageSlug ?? (await this.resolveCartPageSlug(site._id.toString()));
    let layout = layoutIsEmpty(site.layout)
      ? buildDefaultSiteLayout({
          ...(slug ? { shopPageSlug: slug } : {}),
          ...(cartSlug ? { cartPageSlug: cartSlug } : {}),
        })
      : (site.layout as SiteLayout);

    const before = JSON.stringify(layout);

    if (slug) {
      layout = mergeShopNavLink(layout, slug);
    }
    if (cartSlug) {
      layout = mergeCartIcon(layout, cartSlug);
    }

    const shouldSave =
      layoutIsEmpty(site.layout) ||
      before !== JSON.stringify(layout) ||
      (slug ? !layoutHasShopLink(site.layout as SiteLayout, slug) : false) ||
      (cartSlug ? !layoutHasCartIcon(site.layout as SiteLayout) : false);

    if (shouldSave) {
      site.layout = layout;
      await site.save();
    }

    return layout;
  }

  private async resolveShopPageSlug(siteId: string): Promise<string | undefined> {
    const pages = await this.pageModel.find({ siteId: new Types.ObjectId(siteId) }).exec();
    for (const slug of ['shop', 'products', 'store']) {
      const page = pages.find((p) => p.slug === slug);
      if (page) return page.slug;
    }
    for (const page of pages) {
      if (this.rootHasProductGrid(page.root as PageElement[])) return page.slug;
    }
    return undefined;
  }

  private async resolveCartPageSlug(siteId: string): Promise<string | undefined> {
    const pages = await this.pageModel.find({ siteId: new Types.ObjectId(siteId) }).exec();
    const cart = pages.find((p) => p.slug === 'cart');
    if (cart) return cart.slug;
    for (const page of pages) {
      if (this.rootHasCartElements(page.root as PageElement[])) return page.slug;
    }
    return undefined;
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

  async listForOwner(ownerUserId: string) {
    const sites = await this.siteModel.find({ ownerUserId: new Types.ObjectId(ownerUserId) }).sort({ createdAt: -1 }).exec();
    const siteIds = sites.map((s) => s._id);

    const pages = siteIds.length
      ? await this.pageModel
          .find({ siteId: { $in: siteIds }, isHome: true })
          .select('siteId root')
          .lean()
          .exec()
      : [];

    const homePageBySite = new Map<string, string>();
    const homePageRootBySite = new Map<string, ReturnType<typeof normalizePageRoot>>();
    for (const page of pages) {
      const siteKey = page.siteId.toString();
      if (!homePageBySite.has(siteKey)) {
        homePageBySite.set(siteKey, page._id.toString());
        homePageRootBySite.set(siteKey, normalizePageRoot(page.root));
      }
    }

    return sites.map((s) => ({
      ...this.toDto(s),
      homePageId: homePageBySite.get(s._id.toString()) ?? null,
      homePageRoot: homePageRootBySite.get(s._id.toString()) ?? null,
    }));
  }

  async delete(siteId: string, ownerUserId: string) {
    await this.findByIdForOwner(siteId, ownerUserId);
    const siteObjectId = new Types.ObjectId(siteId);
    const pages = await this.pageModel.find({ siteId: siteObjectId }).exec();
    const pageIds = pages.map((p) => p._id);

    if (pageIds.length) {
      await this.pageVersionModel.deleteMany({ pageId: { $in: pageIds } });
      await this.pageModel.deleteMany({ _id: { $in: pageIds } });
    }

    await Promise.all([
      this.storeModel.deleteMany({ siteId: siteObjectId }),
      this.productModel.deleteMany({ siteId: siteObjectId }),
    ]);

    await this.siteModel.findByIdAndDelete(siteId);
    return { deleted: true };
  }

  toDto(site: SiteDocument) {
    return {
      id: site._id.toString(),
      name: site.name,
      slug: site.slug,
      domain: site.domain,
      status: site.status,
      ownerUserId: site.ownerUserId.toString(),
      layout: site.layout ?? { header: [], footer: [] },
      createdAt: (site as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
