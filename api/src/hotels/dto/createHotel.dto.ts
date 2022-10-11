import { IsMongoId, IsOptional, IsString } from 'class-validator';
import mongoose, { ObjectId } from 'mongoose';

export class createHotelDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
