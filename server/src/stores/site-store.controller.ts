import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ListProductsDto } from '../products/dto/list-products.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { ProductsService } from '../products/products.service';
import { SiteStoreService } from './site-store.service';

@Controller('sites/:siteId')
@UseGuards(JwtAuthGuard)
export class SiteStoreController {
  constructor(
    private readonly siteStoreService: SiteStoreService,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get('store')
  async getStore(@Req() req: any, @Param('siteId') siteId: string) {
    const store = await this.siteStoreService.findBySite(siteId, req.user.userId);
    return { store };
  }

  @Post('store')
  createStore(@Req() req: any, @Param('siteId') siteId: string) {
    return this.siteStoreService.createForSite(siteId, req.user.userId);
  }

  @Get('products')
  listProducts(@Req() req: any, @Param('siteId') siteId: string, @Query() query: ListProductsDto) {
    return this.productsService.list(siteId, req.user.userId, query);
  }

  @Post('products')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  createProduct(
    @Req() req: any,
    @Param('siteId') siteId: string,
    @Body() dto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productsService.create(siteId, req.user.userId, dto, image);
  }

  @Get('products/:productId/image')
  async getProductImage(
    @Req() req: any,
    @Param('siteId') siteId: string,
    @Param('productId') productId: string,
    @Res() res: Response,
  ) {
    const image = await this.productsService.getImage(siteId, productId, req.user.userId);
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(image.data);
  }

  @Patch('products/:productId')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  updateProduct(
    @Req() req: any,
    @Param('siteId') siteId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productsService.update(siteId, productId, req.user.userId, dto, image);
  }

  @Delete('products/:productId')
  deleteProduct(@Req() req: any, @Param('siteId') siteId: string, @Param('productId') productId: string) {
    return this.productsService.delete(siteId, productId, req.user.userId);
  }

  @Get('categories')
  listCategories(@Req() req: any, @Param('siteId') siteId: string) {
    return this.categoriesService.list(siteId, req.user.userId);
  }
}
