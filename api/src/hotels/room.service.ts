import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { HotelRoom, HotelRoomDocument } from './room.shema';
import { ID } from 'src/types/common.types';
import { createRoomDto } from './dto/createRoom.dto';
import { updateRoomDto } from './dto/updateRoom.dto';
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

    return await this.roomModel.aggregate(this.query(room._id));
  }

  async findById(id, isEnabled?: true) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('Неверный ID номера', HttpStatus.BAD_REQUEST);
    }
    return await this.roomModel.aggregate(this.query(id, isEnabled)).exec();
  }

  async find(params): Promise<HotelRoom[]> {
    const { limit = 100, offset = 0, isEnabled, hotel } = params;

    return await this.roomModel
      .aggregate(this.query(false, isEnabled, hotel))
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

    return await this.roomModel.aggregate(this.query(updatedRoom._id)).exec();
  }

  query(roomId?, isEnabledValue?, hotelId?) {
    roomId = roomId ? new mongoose.Types.ObjectId(roomId) : { $exists: true };
    hotelId = hotelId
      ? new mongoose.Types.ObjectId(hotelId)
      : { $exists: true };
    isEnabledValue =
      isEnabledValue || isEnabledValue === 'true' ? true : { $exists: true }; // only isInabled or all items

    console.log(
      'roomId?, isEnabledValue?, hotelId?',
      roomId,
      isEnabledValue,
      hotelId,
    );
    return [
      {
        $match: {
          _id: roomId,
          isEnabled: isEnabledValue,
          hotel: hotelId,
        },
      },
      {
        $lookup: {
          from: 'hotels',
          localField: 'hotel',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      {
        $unwind: '$hotel',
      },
      {
        $addFields: {
          id: '$_id',
          hotel: { id: '$hotel._id' },
        },
      },

      {
        $project: {
          _id: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          hotel: { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 },
        },
      },
    ];
  }
}
