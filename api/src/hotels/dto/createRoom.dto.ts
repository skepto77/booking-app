import { IsArray, IsOptional, IsString } from 'class-validator';

export class createRoomDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  hotelId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
