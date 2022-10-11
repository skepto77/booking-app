import { IsMongoId, IsOptional, IsString } from 'class-validator';
import mongoose, { ObjectId } from 'mongoose';

export class updateHotelDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
