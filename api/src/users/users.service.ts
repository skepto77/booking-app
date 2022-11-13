import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ID } from 'src/types/common.types';
import { createUserDto } from './dto/createUser.dto';
import {
  IClientCreateResponse,
  IUser,
  IUserCreateResponse,
  IUserResponse,
  IUserService,
  SearchUserParams,
} from './users.interface';
import { User, UserDocument } from './users.sсhema';
import { genSalt, hash, compare } from 'bcryptjs';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: createUserDto): Promise<User> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (user) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const salt = await genSalt(10);
    const newUser = new this.userModel({
      ...dto,
      passwordHash: await hash(dto.password, salt),
    });

    return await this.userModel.create(newUser);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findAll(params: SearchUserParams): Promise<User[]> {
    const { limit = 100, offset = 0, ...rest } = params;

    // search by email, name, contactPhone or return all items
    const searchOptions =
      Object.keys(rest).length !== 0
        ? Object.entries(rest).map(([key, value]) => {
            return { [key]: { $regex: value, $options: 'i' } };
          })
        : [{ $exists: true }];

    return await this.userModel
      .find()
      .and(searchOptions)
      .sort('field -createdAt')
      .skip(+offset)
      .limit(+limit)
      .exec();
  }

  async findById(id: ID): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  buildCreateUserResponse(user: IUser): IUserCreateResponse {
    const { _id: id, email, name, contactPhone, role } = user;
    return { id, email, name, contactPhone, role };
  }

  buildCreateClientResponse(user: IUser): IClientCreateResponse {
    const { _id: id, email, name } = user;
    return { id, email, name };
  }

  buildUsersResponse(users: IUser[]): IUserResponse[] {
    const result = users.map((user) => {
      const { _id: id, email, name, contactPhone } = user;
      return { id, email, name, contactPhone };
    });

    return result;
  }
}
