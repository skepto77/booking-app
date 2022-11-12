import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

//define id or email of the current user
export const User = createParamDecorator((key: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  // console.log('request.user', request.user);
  if (!request.user) {
    throw new HttpException('Требуется авторизация', HttpStatus.UNAUTHORIZED);
  }
  if (key) {
    return request.user[key]; // 'id' or 'email' and 'role'
  }
  return request.user;
});
