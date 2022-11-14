import { ObjectId } from 'mongoose';
import { ID } from 'src/types/common.types';
import { Hotel } from './hotels.sсhema';
import { HotelRoom } from './room.sсhema';

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
  isEnabled: boolean;
}

export interface IHotelRoomService {
  create(
    images: Express.Multer.File[],
    data: Partial<HotelRoom>,
  ): Promise<HotelRoom>;
  findById(id: ID): Promise<HotelRoom>;
  search(params: SearchRoomsParams): Promise<HotelRoom[]>;
  update(id: ID, data: Partial<HotelRoom>): Promise<HotelRoom>;
}
// images: Array<Express.Multer.File>,

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
