declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export class Strategy extends PassportStrategy {
    constructor(options: any, verify?: (...args: any[]) => any);
    name: string;
  }

  export namespace ExtractJwt {
    function fromAuthHeaderAsBearerToken(): (req: any) => string | null;
    function fromExtractors(extractors: Array<(req: any) => string | null>): (req: any) => string | null;
  }
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';
  function cookieParser(secret?: string | string[]): RequestHandler;
  export = cookieParser;
}
