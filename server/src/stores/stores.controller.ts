import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const user = (req as any).user as { userId: string } | undefined;
    const store = user ? await this.storesService.findMyStore(user.userId) : null;
    return { store: store ?? null };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateStoreDto) {
    const user = (req as any).user as { userId: string };
    const created = await this.storesService.createMyStore(user.userId, dto);
    return { store: created };
  }
}

