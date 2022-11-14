import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { HotelRoom, HotelRoomDocument } from './room.sсhema';
import { ID } from 'src/types/common.types';
import { createRoomDto } from './dto/createRoom.dto';
import { updateRoomDto } from './dto/updateRoom.dto';
import { uploadFiles } from 'src/helpers/uploadFiles';
import { IHotelRoomService } from './hotels.interface';

@Injectable()
export class HotelRoomService implements IHotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly roomModel: Model<HotelRoomDocument>,
  ) {}

  async create(
    images: Array<Express.Multer.File>,
    dto: createRoomDto,
  ): Promise<any> {
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

  async findById(id): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('Неверный ID номера', HttpStatus.BAD_REQUEST);
    }
    return await this.roomModel.aggregate(this.query(id)).exec();
  }

  async search(params): Promise<HotelRoom[]> {
    const { limit = 100, offset = 0, isEnabled, hotel } = params;

    return await this.roomModel
      .aggregate(this.query(false, isEnabled, hotel))
      .sort('field -id')
      .limit(+limit)
      .skip(+offset)
      .exec();
  }

  async update(id: ID, data: updateRoomDto): Promise<any> {
    const room = await this.roomModel.findById(id).exec();
    const { images } = data;
    const newFiles = await uploadFiles(images, room);

    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          hotel: data.hotelId,
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
      isEnabledValue !== undefined
        ? isEnabledValue === 'true'
        : { $exists: true }; // isEnabled value or all items

    console.log(isEnabledValue);
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
