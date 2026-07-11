import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SitesService } from '../sites/sites.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './products.schema';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly sitesService: SitesService,
  ) {}

  async onModuleInit() {
    await this.dropLegacyOwnerNameIndex();
  }

  private async dropLegacyOwnerNameIndex() {
    try {
      await this.productModel.collection.dropIndex('owner_1_name_1');
      this.logger.log('Dropped legacy products index owner_1_name_1');
    } catch (err: any) {
      const code = err?.code;
      const message = String(err?.message ?? '');
      if (code === 27 || code === 26 || message.includes('index not found')) return;
      this.logger.warn(`Could not drop legacy products index owner_1_name_1: ${message}`);
    }
  }

  async list(siteId: string, ownerUserId: string, query: ListProductsDto) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    return this.listForSite(siteId, query);
  }

  async listPublic(siteSlug: string) {
    const site = await this.sitesService.findBySlugPublic(siteSlug);
    const items = await this.productModel
      .find({ siteId: site._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    return {
      items: items.map((p) => this.toPublicDto(p, siteSlug)),
      total: items.length,
      page: 1,
      limit: 100,
      totalPages: 1,
    };
  }

  private async listForSite(siteId: string, query: ListProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { siteId: new Types.ObjectId(siteId) };
    if (query.search?.trim()) {
      const search = query.search.trim();
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.productModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((p) => this.toDto(p)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async create(
    siteId: string,
    ownerUserId: string,
    dto: CreateProductDto,
    file?: Express.Multer.File,
    retried = false,
  ) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);

    const image = this.parseUploadedImage(file);

    try {
      const created = await this.productModel.create({
        siteId: new Types.ObjectId(siteId),
        title: dto.title.trim(),
        description: dto.description?.trim() ?? '',
        price: this.parsePrice(dto.price),
        imageUrl: '',
        imageMimeType: image?.mimeType ?? '',
        ...(image ? { imageData: image.data } : {}),
      });

      return this.toDto(created);
    } catch (err: any) {
      if (err?.code === 11000) {
        const keyPattern = err?.keyPattern ?? {};
        if (!retried && ('owner' in keyPattern || 'name' in keyPattern)) {
          await this.dropLegacyOwnerNameIndex();
          return this.create(siteId, ownerUserId, dto, file, true);
        }
      }
      throw err;
    }
  }

  async update(
    siteId: string,
    productId: string,
    ownerUserId: string,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const product = await this.productModel
      .findOne({ _id: new Types.ObjectId(productId), siteId: new Types.ObjectId(siteId) })
      .exec();
    if (!product) throw new NotFoundException('Product not found');

    if (dto.title !== undefined) product.title = dto.title.trim();
    if (dto.description !== undefined) product.description = dto.description.trim();
    if (dto.price !== undefined) product.price = this.parsePrice(dto.price);

    const image = this.parseUploadedImage(file);
    if (image) {
      product.imageMimeType = image.mimeType;
      product.imageData = image.data;
    }

    await product.save();
    return this.toDto(product);
  }

  async delete(siteId: string, productId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const result = await this.productModel
      .deleteOne({ _id: new Types.ObjectId(productId), siteId: new Types.ObjectId(siteId) })
      .exec();
    if (!result.deletedCount) throw new NotFoundException('Product not found');
    return { deleted: true };
  }

  async getImage(siteId: string, productId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    return this.getImageForProduct(siteId, productId);
  }

  async getImagePublic(siteSlug: string, productId: string) {
    const site = await this.sitesService.findBySlugPublic(siteSlug);
    return this.getImageForProduct(site._id.toString(), productId);
  }

  private async getImageForProduct(siteId: string, productId: string) {
    const product = await this.productModel
      .findOne({ _id: new Types.ObjectId(productId), siteId: new Types.ObjectId(siteId) })
      .select('+imageData')
      .exec();
    if (!product?.imageData?.length) throw new NotFoundException('Product image not found');

    return {
      mimeType: product.imageMimeType || 'application/octet-stream',
      data: product.imageData,
    };
  }

  async findById(siteId: string, productId: string, ownerUserId: string) {
    await this.sitesService.findByIdForOwner(siteId, ownerUserId);
    const product = await this.productModel
      .findOne({ _id: new Types.ObjectId(productId), siteId: new Types.ObjectId(siteId) })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return this.toDto(product);
  }

  private parsePrice(value?: string) {
    if (value === undefined || value === null || value === '') return 0;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      throw new BadRequestException('Price must be a non-negative number');
    }
    return Math.round(n * 100) / 100;
  }

  private parseUploadedImage(file?: Express.Multer.File) {
    if (!file) return null;

    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Image must be JPEG, PNG, WebP, or GIF');
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }

    return {
      mimeType: file.mimetype,
      data: file.buffer,
    };
  }

  private imagePath(siteId: string, productId: string) {
    return `/sites/${siteId}/products/${productId}/image`;
  }

  publicImagePath(siteSlug: string, productId: string) {
    return `/public/${siteSlug}/products/${productId}/image`;
  }

  toPublicDto(doc: ProductDocument, siteSlug: string) {
    const row = doc as ProductDocument & { createdAt?: Date; updatedAt?: Date };
    const hasStoredImage = Boolean(doc.imageData?.length);
    return {
      id: doc._id.toString(),
      siteId: doc.siteId.toString(),
      title: doc.title,
      description: doc.description,
      price: doc.price ?? 0,
      imageUrl: hasStoredImage ? this.publicImagePath(siteSlug, doc._id.toString()) : doc.imageUrl,
      hasImage: hasStoredImage,
      createdAt: row.createdAt?.toISOString?.() ?? null,
      updatedAt: row.updatedAt?.toISOString?.() ?? null,
    };
  }

  private toDto(doc: ProductDocument) {
    const row = doc as ProductDocument & { createdAt?: Date; updatedAt?: Date };
    const hasStoredImage = Boolean(doc.imageData?.length);
    return {
      id: doc._id.toString(),
      siteId: doc.siteId.toString(),
      title: doc.title,
      description: doc.description,
      price: doc.price ?? 0,
      imageUrl: hasStoredImage ? this.imagePath(doc.siteId.toString(), doc._id.toString()) : doc.imageUrl,
      hasImage: hasStoredImage,
      createdAt: row.createdAt?.toISOString?.() ?? null,
      updatedAt: row.updatedAt?.toISOString?.() ?? null,
    };
  }
}
