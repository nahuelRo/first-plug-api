// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    DB_CONNECTION_STRING: string;
    JWTSECRETKEY: string;
    JWTREFRESHTOKENKEY: string;
  }
}

declare module 'express' {
  export interface Request {
    user?: string | jwt.JwtPayload;
  }
}
