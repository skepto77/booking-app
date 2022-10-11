import { Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Schema } from 'mongoose';

import { HotelRoom, HotelRoomDocument } from './room.shema';
import { ID } from 'src/types/common.types';
import { createRoomDto } from './dto/createRoom.dto';
import { updateRoomDto } from './dto/updateRoom.dto';
import { query } from 'src/helpers/roomQuery';
import { uploadFiles } from 'src/helpers/uploadFiles';

@Injectable()
export class HotelRoomService implements HotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly roomModel: Model<HotelRoomDocument>,
  ) {}

  async create(images: Array<Express.Multer.File>, dto: createRoomDto) {
    const roomWithoutImages = await this.roomModel.create({
      ...dto,
      hotel: dto.hotelId,
    });

    const files = await uploadFiles(images, roomWithoutImages);

    const room = await this.roomModel
      .findByIdAndUpdate(
        roomWithoutImages.id,
        {
          images: files,
        },
        { new: true },
      )
      .exec();

    return await this.roomModel.aggregate(query(room._id));
  }

  async findById(id, isEnabled?: true) {
    return await this.roomModel.aggregate(query(id, isEnabled)).exec();
  }

  async find(params): Promise<HotelRoom[]> {
    const { limit = 100, offset = 0, isEnabled, hotel } = params;

    return await this.roomModel
      .aggregate(query(false, isEnabled, hotel))
      .sort('field -id')
      .limit(+limit)
      .skip(+offset)
      .exec();
  }

  async update(images: Array<Express.Multer.File>, dto: updateRoomDto, id: ID) {
    const room = await this.roomModel.findById(id).exec();
    const newFiles = await uploadFiles(images, room);

    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          hotel: dto.hotelId,
          images: [...room.images, ...newFiles],
        },
        { new: true },
      )
      .exec();

    return await this.roomModel.aggregate(query(updatedRoom._id)).exec();
  }
}
