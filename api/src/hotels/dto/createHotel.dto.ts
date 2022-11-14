import { IsOptional, IsString } from 'class-validator';

export class createHotelDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
