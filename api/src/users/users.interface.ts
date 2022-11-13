import { ID } from 'src/types/common.types';
import { User } from './users.sсhema';

export interface SearchUserParams {
  limit: number;
  offset: number;
  email: string;
  name: string;
  contactPhone: string;
}

export interface IUserService {
  create(data: Partial<User>): Promise<User>;
  findById(id: ID): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(params: SearchUserParams): Promise<User[]>;
}

export enum Role {
  Client = 'client',
  Admin = 'admin',
  Manager = 'manager',
}

export interface IUser extends User {
  _id?: ID;
}

export interface IUserCreateResponse extends Omit<User, 'passwordHash'> {
  id: ID;
}

export type IUserResponse = Omit<IUserCreateResponse, 'role'>;

export type IClientCreateResponse = Omit<
  IUserCreateResponse,
  'role' | 'contactPhone'
>;

// export interface IExpressRequest extends Request {
//   user?: User;
// }
