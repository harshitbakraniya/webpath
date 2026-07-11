import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(user: JwtUser): string {
    return this.jwtService.sign({
      sub: user.userId,
      email: user.email,
      name: user.name,
    });
  }
}

