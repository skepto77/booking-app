import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHotelDto } from './dto/createHotel.dto';
import { Hotel, HotelDocument } from './hotels.sсhema';
import { IHotel, IHotelResponse, IHotelService } from './hotels.interface';
import { ID } from '../types/common.types';
import { updateHotelDto } from './dto/updateHotel.dto';

@Injectable()
export class HotelsService implements IHotelService {
  constructor(
    @InjectModel(Hotel.name) private readonly hotelModel: Model<HotelDocument>,
  ) {}

  async create(data: createHotelDto): Promise<Hotel> {
    return await this.hotelModel.create(data);
  }

  async updateHotel(id, data: updateHotelDto): Promise<any> {
    return await this.hotelModel
      .findByIdAndUpdate(id, data, {
        new: true,
      })
      .exec();
  }

  async findById(id: ID): Promise<Hotel> {
    return await this.hotelModel.findById(id).exec();
  }

  async search(query: any): Promise<Hotel[]> {
    const { limit = 10, offset = 0 } = query;
    const hotels = await this.hotelModel
      .aggregate()
      .sort('field -createdAt')
      .addFields({
        id: '$_id',
      })
      .project({
        _id: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      })
      .skip(+offset)
      .limit(+limit)
      .exec();
    return hotels;
  }

  buildHotelResponse(hotel: IHotel): IHotelResponse {
    const { _id: id, title, description } = hotel;
    return { id, title, description };
  }
}
