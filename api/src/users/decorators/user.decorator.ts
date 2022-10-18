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

  //'id' or 'email'
  if (key) {
    return request.user[key];
  }
  return request.user;
});
