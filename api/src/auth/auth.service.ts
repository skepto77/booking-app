import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new HttpException('Неверный email', HttpStatus.UNAUTHORIZED);
    }

    const isCorrectPassword = await compare(password, user.passwordHash);
    if (!isCorrectPassword) {
      throw new HttpException('Неверный пароль', HttpStatus.UNAUTHORIZED);
    }

    const { role, contactPhone, name } = user;
    const payload = { email, role };
    const token = await this.jwtService.signAsync(payload);

    return { token, email, name, contactPhone };
  }
}
