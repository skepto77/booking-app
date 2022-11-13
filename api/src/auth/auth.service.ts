import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { ID } from 'src/types/common.types';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.sсhema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }) {
    const user: IUser = await this.usersService.findByEmail(email);

    if (!user) {
      throw new HttpException('Неверный email', HttpStatus.UNAUTHORIZED);
    }

    const isCorrectPassword = await compare(password, user.passwordHash);
    if (!isCorrectPassword) {
      throw new HttpException('Неверный пароль', HttpStatus.UNAUTHORIZED);
    }

    const { role, contactPhone, name, _id: id } = user;
    const payload = { email, role, id };
    console.log('payload', payload);
    const token = await this.jwtService.signAsync(payload);

    return { token, email, name, contactPhone };
  }
}
