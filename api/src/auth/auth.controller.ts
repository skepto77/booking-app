import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { createUserDto } from 'src/users/dto/createUser.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('auth/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() data: AuthDto, @Res() res) {
    const { token, email, name, contactPhone } = await this.authService.login(
      data,
    );

    return res.cookie('token', token, { httpOnly: true }).json({
      email,
      name,
      contactPhone,
    });
  }

  @Post('auth/logout')
  async logout(@Res() res) {
    res.clearCookie('token').end();
  }

  @Post('client/register')
  @UsePipes(new ValidationPipe())
  async create(@Body() data: createUserDto) {
    const user: IUser = await this.usersService.create(data);
    return this.usersService.buildCreateClientResponse(user);
  }
}
