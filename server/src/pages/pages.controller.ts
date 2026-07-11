import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PageVersionsService } from '../page-versions/page-versions.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@Controller('sites/:siteId/pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly pageVersionsService: PageVersionsService,
  ) {}

  @Post()
  create(@Req() req: any, @Param('siteId') siteId: string, @Body() dto: CreatePageDto) {
    return this.pagesService.create(siteId, req.user.userId, dto);
  }

  @Get()
  list(@Req() req: any, @Param('siteId') siteId: string) {
    return this.pagesService.listForSite(siteId, req.user.userId);
  }

  @Get('by-id/:pageId')
  findById(@Req() req: any, @Param('siteId') siteId: string, @Param('pageId') pageId: string) {
    return this.pagesService.findById(siteId, pageId, req.user.userId);
  }

  @Get(':slug')
  findBySlug(@Req() req: any, @Param('siteId') siteId: string, @Param('slug') slug: string) {
    return this.pagesService.findBySlug(siteId, req.user.userId, slug);
  }

  @Patch(':pageId')
  update(
    @Req() req: any,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.update(siteId, pageId, req.user.userId, dto);
  }

  @Get(':pageId/versions')
  listVersions(@Param('pageId') pageId: string) {
    return this.pageVersionsService.list(pageId);
  }

  @Post(':pageId/versions/:versionId/restore')
  async restore(
    @Req() req: any,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Param('versionId') versionId: string,
  ) {
    const snapshot = await this.pageVersionsService.getSnapshot(versionId);
    return this.pagesService.update(siteId, pageId, req.user.userId, {
      root: snapshot.snapshot,
    });
  }
}
