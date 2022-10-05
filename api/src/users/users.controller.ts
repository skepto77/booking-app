import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { createUserDto } from './dto/createUser.dto';
import { IUser, Role, SearchUserParams } from './users.inteface';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin/users/')
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  async create(@Body() data: createUserDto) {
    const user: IUser = await this.usersService.create(data);
    return this.usersService.buildCreateUserResponse(user);
  }

  @Get('admin/users/')
  @Roles(Role.Admin)
  async findAllByAdmin(@Query() query: SearchUserParams) {
    const users: IUser[] = await this.usersService.findAll(query);
    return this.usersService.buildUsersResponse(users);
  }

  @Get('manager/users/')
  @Roles(Role.Admin, Role.Manager)
  async findAll(@Query() query: SearchUserParams) {
    const users: IUser[] = await this.usersService.findAll(query);
    return this.usersService.buildUsersResponse(users);
  }
}
