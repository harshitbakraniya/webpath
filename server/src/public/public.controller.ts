import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PagesService } from '../pages/pages.service';
import { ProductsService } from '../products/products.service';
import { SitesService } from '../sites/sites.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly sitesService: SitesService,
    private readonly pagesService: PagesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get(':slugOrDomain')
  async getPublishedSite(@Param('slugOrDomain') slugOrDomain: string) {
    const site = await this.sitesService.findBySlugPublic(slugOrDomain);
    const page = await this.pagesService.getHomePageForPublishedSite(site._id);
    const layout = await this.sitesService.getPublishedLayout(site);
    if (!page) return { site: this.sitesService.toDto(site), page: null, layout };
    return {
      site: this.sitesService.toDto(site),
      page: this.pagesService.toDocument(page),
      layout,
    };
  }

  @Get(':slugOrDomain/pages/:pageSlug')
  async getPublishedPage(
    @Param('slugOrDomain') slugOrDomain: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    const site = await this.sitesService.findBySlugPublic(slugOrDomain);
    const page = await this.pagesService.getPublishedPageBySlug(site._id, pageSlug);
    const layout = await this.sitesService.getPublishedLayout(site);
    return {
      site: this.sitesService.toDto(site),
      page: this.pagesService.toDocument(page),
      layout,
    };
  }

  @Get(':slugOrDomain/products')
  listPublicProducts(@Param('slugOrDomain') slugOrDomain: string) {
    return this.productsService.listPublic(slugOrDomain);
  }

  @Get(':slugOrDomain/products/:productId/image')
  async getPublicProductImage(
    @Param('slugOrDomain') slugOrDomain: string,
    @Param('productId') productId: string,
    @Res() res: Response,
  ) {
    const image = await this.productsService.getImagePublic(slugOrDomain, productId);
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(image.data);
  }
}
