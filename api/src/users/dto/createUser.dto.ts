import { IsOptional, IsString } from 'class-validator';
import { Role } from '../users.inteface';

export class createUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsString()
  role: Role;
}
