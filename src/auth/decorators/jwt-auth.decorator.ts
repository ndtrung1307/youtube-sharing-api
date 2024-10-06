import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: any;
}

export interface userPayload {
  email: string;
  userId: string;
  iat: number;
  exp: number;
}

export const JwtAuth = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<userPayload> => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('JWT token is missing');
    }

    const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
    try {
      const payload = jwtService.verify(token);
      request.user = payload;
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token');
    }
  },
);
