import { IsOptional, IsString } from 'class-validator';
import { Role } from '../users.interface';

export class createUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactPhone: string;

  @IsString()
  @IsOptional()
  role: Role;
}
