import { ID } from 'src/types/common.types';
import { Reservation } from './reservations.shema';

export interface ReservationDto {
  user: ID;
  hotel: ID;
  room: ID;
  dateStart: Date;
  dateEnd: Date;
}

export interface ReservationSearchOptions {
  user: ID;
  dateStart: Date;
  dateEnd: Date;
}
export interface IReservation {
  addReservation(data: ReservationDto): Promise<Reservation>;
  removeReservation(id: ID): Promise<void>;
  getReservations(
    filter: ReservationSearchOptions,
  ): Promise<Array<Reservation>>;
}

export type newReservation = Reservation & { _id?: string };
