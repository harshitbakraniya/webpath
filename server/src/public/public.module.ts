import { Module } from '@nestjs/common';
import { PagesModule } from '../pages/pages.module';
import { ProductsService } from '../products/products.service';
import { Product, ProductSchema } from '../products/products.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SitesModule } from '../sites/sites.module';
import { PublicController } from './public.controller';

@Module({
  imports: [
    SitesModule,
    PagesModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [PublicController],
  providers: [ProductsService],
})
export class PublicModule {}
