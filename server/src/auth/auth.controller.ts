import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtUser } from './auth.types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) { }

  private getCookieOptions() {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      sameSite: 'none' as const,
      secure: isProd,
      path: '/',
      maxAge: SEVEN_DAYS_MS,
    };
  }

  private getCookieName() {
    return this.config.get<string>('JWT_COOKIE_NAME') ?? 'access_token';
  }

  private setAccessTokenCookie(res: any, token: string) {
    res.cookie(this.getCookieName(), token, this.getCookieOptions());
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: any) {
    const created = await this.usersService.createUser({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });

    const jwtUser: JwtUser = { userId: created.id, email: created.email, name: created.name ?? created.email };
    const token = this.authService.signAccessToken(jwtUser);
    this.setAccessTokenCookie(res, token);

    return { user: jwtUser };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    await this.usersService.validatePassword(user, dto.password);

    const jwtUser: JwtUser = {
      userId: user._id.toString(),
      email: user.email,
      name: this.usersService.getDisplayName(user),
    };

    const token = this.authService.signAccessToken(jwtUser);
    this.setAccessTokenCookie(res, token);
    return { user: jwtUser };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const user = (req as any).user as JwtUser | undefined;
    if (!user) throw new BadRequestException('Missing user');
    return { user };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const user = (req as any).user as JwtUser;
    const updated = await this.usersService.updateName(user.userId, dto.name);
    const jwtUser: JwtUser = { userId: updated.id, email: updated.email, name: updated.name ?? updated.email };
    return { user: jwtUser };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie(this.getCookieName(), this.getCookieOptions());
    return { ok: true };
  }
}

