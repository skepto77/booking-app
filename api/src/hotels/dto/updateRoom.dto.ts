import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class updateRoomDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  hotelId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true') // string to boolean
  isEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: Array<File | string | Express.Multer.File>;
}
