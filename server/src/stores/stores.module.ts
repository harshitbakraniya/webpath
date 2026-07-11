import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../categories/categories.schema';
import { CategoriesService } from '../categories/categories.service';
import { PagesModule } from '../pages/pages.module';
import { Product, ProductSchema } from '../products/products.schema';
import { ProductsService } from '../products/products.service';
import { SitesModule } from '../sites/sites.module';
import { SiteStoreController } from './site-store.controller';
import { SiteStoreService } from './site-store.service';
import { Store, StoreSchema } from './stores.schema';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    SitesModule,
    PagesModule,
  ],
  controllers: [StoresController, SiteStoreController],
  providers: [StoresService, SiteStoreService, ProductsService, CategoriesService],
  exports: [StoresService, SiteStoreService, ProductsService, CategoriesService],
})
export class StoresModule {}
