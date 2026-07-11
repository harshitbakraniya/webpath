import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteLayoutDto } from './dto/update-site-layout.dto';
import { SitesService } from './sites.service';

@Controller('sites')
@UseGuards(JwtAuthGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSiteDto) {
    return this.sitesService.create(req.user.userId, dto);
  }

  @Get()
  list(@Req() req: any) {
    return this.sitesService.listForOwner(req.user.userId);
  }

  @Post(':siteId/publish')
  async publish(@Req() req: any, @Param('siteId') siteId: string) {
    const snapshot = { publishedAt: new Date().toISOString() };
    return this.sitesService.publish(siteId, req.user.userId, snapshot);
  }

  @Get(':siteId/layout')
  getLayout(@Req() req: any, @Param('siteId') siteId: string) {
    return this.sitesService.getLayout(siteId, req.user.userId);
  }

  @Patch(':siteId/layout')
  updateLayout(@Req() req: any, @Param('siteId') siteId: string, @Body() dto: UpdateSiteLayoutDto) {
    return this.sitesService.updateLayout(siteId, req.user.userId, dto);
  }

  @Delete(':siteId')
  delete(@Req() req: any, @Param('siteId') siteId: string) {
    return this.sitesService.delete(siteId, req.user.userId);
  }
}
