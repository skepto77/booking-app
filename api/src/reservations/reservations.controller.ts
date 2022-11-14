import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Role } from 'src/users/users.interface';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { createReservationDto } from './dto/createReservation.dto';
import { User } from 'src/users/decorators/user.decorator';
import { IdValidationPipe } from 'src/pipes/idValidation.pipe';
import {
  newReservation,
  ReservationSearchOptions,
} from './reservations.interface';
import { HotelRoomService } from 'src/hotels/room.service';

@Controller()
export class ReservationsController {
  constructor(
    private readonly reservationService: ReservationsService,
    private readonly hotelRoomService: HotelRoomService,
  ) {}

  @Post('client/reservations')
  @Roles(Role.Client)
  @UsePipes(new ValidationPipe())
  async addReservation(
    @User('id') user: string,
    @Body() dto: createReservationDto,
  ) {
    const currentRoom = await this.hotelRoomService.findById(dto.hotelRoom);
    if (!currentRoom.length) {
      throw new HttpException(
        'Номер недоступен для бронирования',
        HttpStatus.BAD_REQUEST,
      );
    }
    const {
      id: room,
      hotel: { id: hotel },
    } = currentRoom[0];
    const { dateStart, dateEnd } = dto;
    const data = { user, room, hotel, dateStart, dateEnd };
    const reservation: newReservation =
      await this.reservationService.addReservation(data);

    return await this.reservationService.buildReservationsResponse(
      reservation._id,
    );
  }

  @Delete('client/reservations/:id')
  @Roles(Role.Client)
  async removeReservation(
    @User('id') userId,
    @Param('id', IdValidationPipe) reservationId: string,
  ) {
    await this.reservationService.removeReservation(reservationId, userId);
    return;
  }

  @Delete('manager/reservations/:id/:reservationId')
  @Roles(Role.Manager)
  async removeReservationManager(
    @Param('id', IdValidationPipe) id: string,
    @Param('reservationId', IdValidationPipe) reservationId: string,
  ) {
    await this.reservationService.removeReservationManager(reservationId, id);
    return;
  }

  @Get('client/reservations')
  @Roles(Role.Client)
  async getReservationsClient(@User('id') user, @Query() query) {
    const { dateStart, dateEnd } = query;
    const filter: ReservationSearchOptions = { user, dateStart, dateEnd };
    return await this.reservationService.getReservations(filter);
  }

  @Get('manager/reservations/:userId')
  @Roles(Role.Manager)
  async getReservationsManager(
    @Param('userId', IdValidationPipe) user: string,
    @Query() query,
  ) {
    const { dateStart, dateEnd } = query;
    const filter: ReservationSearchOptions = { user, dateStart, dateEnd };
    return await this.reservationService.getReservations(filter);
  }
}
