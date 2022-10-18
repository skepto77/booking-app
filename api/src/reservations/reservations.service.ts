import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './reservations.shema';
import {
  IReservation,
  ReservationDto,
  ReservationSearchOptions,
} from './reservations.interface';
import { ID } from 'src/types/common.types';

@Injectable()
export class ReservationsService implements IReservation {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async addReservation(data: ReservationDto): Promise<Reservation> {
    const {
      user: userId,
      room: roomId,
      hotel: hotelId,
      dateStart,
      dateEnd,
    } = data;

    const checkReservations = await this.reservationModel
      .find({
        roomId: roomId,
        dateStart: {
          $gte: new Date(dateStart),
        },
        dateEnd: {
          $lte: new Date(dateEnd),
        },
      })
      .exec();

    // console.log('checkReservations', checkReservations);

    if (checkReservations.length > 0) {
      throw new HttpException(
        'Номер недоступен для бронирования на выбранные даты',
        HttpStatus.BAD_REQUEST,
      );
    }

    const reservation = await this.reservationModel.create({
      userId,
      hotelId,
      roomId,
      dateStart,
      dateEnd,
    });

    console.log('reservation', reservation);
    return reservation;
  }

  async removeReservation(id: ID, userId?): Promise<void> {
    const reservation = await this.reservationModel.findById({ _id: id });
    if (!reservation) {
      throw new HttpException(
        'Брони с указанным ID не существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (String(reservation.userId) !== String(userId)) {
      throw new HttpException(
        'ID текущего пользователя не совпадает с ID пользователя брони',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.reservationModel.findByIdAndDelete({ _id: id });
  }

  async removeReservationManager(id: ID, userId): Promise<void> {
    const reservation = await this.reservationModel.find({ _id: id, userId });

    if (!reservation.length) {
      throw new HttpException(
        'Брони для пользователя с указанным ID не существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.reservationModel.findByIdAndDelete({ _id: id });
  }

  async getReservations(
    filter: ReservationSearchOptions,
  ): Promise<Reservation[]> {
    const { user, dateStart, dateEnd } = filter;

    return await this.buildReservationsResponse(null, user, dateStart, dateEnd);
  }

  buildReservationsResponse = async (
    reservationId,
    userId = null,
    dateStart = null,
    dateEnd = null,
  ) => {
    // console.log('date query', reservationId, userId, dateStart, dateEnd);
    reservationId = reservationId
      ? new mongoose.Types.ObjectId(reservationId)
      : { $exists: true };

    userId = userId ? new mongoose.Types.ObjectId(userId) : { $exists: true };
    dateStart = dateStart ? { $gte: new Date(dateStart) } : { $exists: true };
    dateEnd = dateEnd ? { $lte: new Date(dateEnd) } : { $exists: true };

    return await this.reservationModel
      .aggregate([
        {
          $match: {
            _id: reservationId,
            userId,
            dateStart,
            dateEnd,
          },
        },
        {
          $lookup: {
            from: 'hotelrooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'hotelRoom',
          },
        },
        {
          $unwind: '$hotelRoom',
        },
        {
          $lookup: {
            from: 'hotels',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotel',
          },
        },
        {
          $unwind: '$hotel',
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            userId: 0,
            hotelId: 0,
            roomId: 0,
            createdAt: 0,
            updatedAt: 0,
            hotelRoom: {
              __v: 0,
              _id: 0,
              id: 0,
              createdAt: 0,
              updatedAt: 0,
              hotel: 0,
              isEnabled: 0,
            },
            hotel: { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 },
          },
        },
      ])
      .exec();
  };
}
