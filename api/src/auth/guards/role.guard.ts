import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    const token = authorization.replace(/Bearer /, '');
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    if (!payload.role) {
      throw new HttpException('Требуется авторизация', HttpStatus.UNAUTHORIZED);
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }

    const matchRoles = () => roles.includes(payload.role);

    if (payload.role && matchRoles()) {
      return true;
    }

    throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
  }
}
