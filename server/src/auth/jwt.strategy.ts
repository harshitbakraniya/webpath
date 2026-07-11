import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const cookieName = config.get<string>('JWT_COOKIE_NAME') ?? 'access_token';
    const jwtSecret = config.get<string>('JWT_SECRET') ?? 'dev_secret_change_me';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => req?.cookies?.[cookieName],
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}

