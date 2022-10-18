import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { ID } from 'src/types/common.types';

export class createReservationDto {
  @IsOptional()
  @IsString()
  user: ID;

  @IsOptional()
  @IsString()
  hotel: ID;

  @IsString()
  hotelRoom: ID;

  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  dateStart: Date;

  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  dateEnd: Date;
}
