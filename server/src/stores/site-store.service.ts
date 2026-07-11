import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { PagesService } from '../pages/pages.service';
import { SitesService } from '../sites/sites.service';
import { Store, StoreDocument } from './stores.schema';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniqueShopSlug() {
  return `shop-${randomBytes(4).toString('hex')}`;
}

@Injectable()
export class SiteStoreService {
  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly sitesService: SitesService,
    private readonly pagesService: PagesService,
  ) {}

  async findBySite(siteId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const siteObjectId = new Types.ObjectId(siteId);

    const existing = await this.storeModel.findOne({ siteId: siteObjectId }).exec();
    if (existing) {
      await this.ensureStorePages(siteId, ownerUserId, existing);
      return this.toDto(existing);
    }

    const productsPage = await this.pagesService.findProductsPage(siteId);
    if (!productsPage) return null;

    const store = await this.recoverStoreRecord(siteId, ownerUserId, productsPage.id);
    await this.ensureStorePages(siteId, ownerUserId);
    return store;
  }

  private async ensureStorePages(siteId: string, ownerUserId: string, storeDoc?: StoreDocument) {
    const productsPage = await this.createProductsPage(siteId, ownerUserId);
    const cartPage = await this.createCartPage(siteId, ownerUserId);

    if (storeDoc) {
      let dirty = false;
      if (!storeDoc.productsPageId && productsPage) {
        storeDoc.productsPageId = new Types.ObjectId(productsPage.id);
        dirty = true;
      }
      if (!storeDoc.cartPageId && cartPage) {
        storeDoc.cartPageId = new Types.ObjectId(cartPage.id);
        dirty = true;
      }
      if (dirty) await storeDoc.save();
    }

    if (productsPage) {
      await this.sitesService.addShopNavLink(siteId, productsPage.slug);
    }
    if (cartPage) {
      await this.sitesService.addCartIcon(siteId, cartPage.slug);
    }

    return { productsPage, cartPage };
  }

  private async recoverStoreRecord(siteId: string, ownerUserId: string, productsPageId: string) {
    const siteObjectId = new Types.ObjectId(siteId);
    const existing = await this.storeModel.findOne({ siteId: siteObjectId }).exec();
    if (existing) return this.toDto(existing);

    const site = await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const storeName = `${site.name} Store`;
    const storeSlug = slugify(storeName) || 'store';
    const cartPage = await this.createCartPage(siteId, ownerUserId);

    try {
      const created = await this.storeModel.create({
        ownerUserId: new Types.ObjectId(ownerUserId),
        siteId: siteObjectId,
        productsPageId: new Types.ObjectId(productsPageId),
        ...(cartPage ? { cartPageId: new Types.ObjectId(cartPage.id) } : {}),
        name: storeName,
        slug: storeSlug,
        templateKey: 'store',
      });
      return this.toDto(created);
    } catch (err: any) {
      if (err?.code === 11000) {
        const recovered = await this.storeModel.findOne({ siteId: siteObjectId }).exec();
        if (recovered) return this.toDto(recovered);
      }
      throw err;
    }
  }

  private async createProductsPage(siteId: string, ownerUserId: string) {
    const existing = await this.pagesService.findProductsPage(siteId);
    if (existing) return existing;

    return this.pagesService.findOrCreate(siteId, ownerUserId, {
      templateId: 'products',
      slug: uniqueShopSlug(),
      title: 'Shop',
    });
  }

  private async createCartPage(siteId: string, ownerUserId: string) {
    const existing = await this.pagesService.findCartPage(siteId);
    if (existing) return existing;

    return this.pagesService.findOrCreate(siteId, ownerUserId, {
      templateId: 'cart',
      slug: 'cart',
      title: 'Cart',
    });
  }

  async createForSite(siteId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);

    const siteObjectId = new Types.ObjectId(siteId);
    const existing = await this.storeModel.findOne({ siteId: siteObjectId }).exec();

    if (existing) {
      const { productsPage, cartPage } = await this.ensureStorePages(siteId, ownerUserId, existing);
      return {
        store: this.toDto(existing),
        productsPage,
        cartPage,
      };
    }

    const productsPageExisting = await this.pagesService.findProductsPage(siteId);
    if (productsPageExisting) {
      const store = await this.recoverStoreRecord(siteId, ownerUserId, productsPageExisting.id);
      const { productsPage, cartPage } = await this.ensureStorePages(siteId, ownerUserId);
      return { store, productsPage, cartPage };
    }

    const site = await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const storeName = `${site.name} Store`;
    const storeSlug = slugify(storeName) || 'store';
    const productsPage = await this.createProductsPage(siteId, ownerUserId);
    const cartPage = await this.createCartPage(siteId, ownerUserId);

    await this.sitesService.addShopNavLink(siteId, productsPage.slug);
    await this.sitesService.addCartIcon(siteId, cartPage.slug);

    try {
      const created = await this.storeModel.create({
        ownerUserId: new Types.ObjectId(ownerUserId),
        siteId: siteObjectId,
        productsPageId: new Types.ObjectId(productsPage.id),
        cartPageId: new Types.ObjectId(cartPage.id),
        name: storeName,
        slug: storeSlug,
        templateKey: 'store',
      });

      return {
        store: this.toDto(created),
        productsPage,
        cartPage,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        const recovered = await this.storeModel.findOne({ siteId: siteObjectId }).exec();
        if (recovered) {
          return {
            store: this.toDto(recovered),
            productsPage,
            cartPage,
          };
        }
      }
      throw err;
    }
  }

  async deleteForSite(siteId: string) {
    await this.storeModel.deleteMany({ siteId: new Types.ObjectId(siteId) }).exec();
  }

  private toDto(doc: StoreDocument) {
    const row = doc as StoreDocument & { createdAt?: Date; updatedAt?: Date };
    return {
      id: doc._id.toString(),
      siteId: doc.siteId.toString(),
      productsPageId: doc.productsPageId?.toString() ?? null,
      cartPageId: doc.cartPageId?.toString() ?? null,
      name: doc.name,
      slug: doc.slug,
      templateKey: doc.templateKey,
      createdAt: row.createdAt?.toISOString?.() ?? null,
      updatedAt: row.updatedAt?.toISOString?.() ?? null,
    };
  }
}
