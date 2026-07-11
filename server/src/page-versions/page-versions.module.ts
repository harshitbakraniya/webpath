import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageVersion, PageVersionSchema } from './page-versions.schema';
import { PageVersionsService } from './page-versions.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: PageVersion.name, schema: PageVersionSchema }])],
  providers: [PageVersionsService],
  exports: [PageVersionsService],
})
export class PageVersionsModule {}
