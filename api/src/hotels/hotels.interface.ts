import { ObjectId } from 'mongoose';
import { ID } from 'src/types/common.types';
import { Hotel } from './hotels.shema';
import { HotelRoom } from './room.shema';

export interface IHotelService {
  create(data: Partial<Hotel>): Promise<Hotel>;
  findById(id: ID): Promise<Hotel>;
  search(params: Pick<Hotel, 'title'>): Promise<Hotel[]>;
}

export interface SearchHotelsParams {
  limit?: number;
  offset?: number;
}

export interface SearchRoomsParams {
  limit: number;
  offset: number;
  title: string;
  isEnabled?: true;
}

export interface HotelRoomService {
  create(
    images: Express.Multer.File[],
    data: Partial<HotelRoom>,
  ): Promise<HotelRoom>;
  findById(id: ID, isEnabled?: true): Promise<HotelRoom>;
  search(params: SearchRoomsParams): Promise<HotelRoom[]>;
  update(id: ID, data: Partial<HotelRoom>): Promise<HotelRoom>;
}

export interface IHotel extends Hotel {
  _id?: ID;
}

export interface IHotelResponse extends Hotel {
  id?: ID;
}

export interface FileResponse {
  // url: string;
  name: string;
}
