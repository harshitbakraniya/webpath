import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/products.schema';
import { Page, PageSchema } from '../pages/pages.schema';
import { PageVersion, PageVersionSchema } from '../page-versions/page-versions.schema';
import { Store, StoreSchema } from '../stores/stores.schema';
import { SitesController } from './sites.controller';
import { Site, SiteSchema } from './sites.schema';
import { SitesService } from './sites.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Page.name, schema: PageSchema },
      { name: PageVersion.name, schema: PageVersionSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
