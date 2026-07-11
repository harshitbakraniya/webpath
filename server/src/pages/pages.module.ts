import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageVersionsModule } from '../page-versions/page-versions.module';
import { SitesModule } from '../sites/sites.module';
import { PagesController } from './pages.controller';
import { Page, PageSchema } from './pages.schema';
import { PagesService } from './pages.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
    SitesModule,
    PageVersionsModule,
  ],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
