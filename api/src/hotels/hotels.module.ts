import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelsController } from './hotels.controller';
import { HotelRoomService } from './room.service';
import { HotelsService } from './hotels.service';
import { Hotel, HotelSchema } from './hotels.shema';
import { HotelRoom, HotelRoomSchema } from './room.shema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
  ],
  controllers: [HotelsController],
  providers: [HotelsService, HotelRoomService],
  exports: [HotelRoomService],
})
export class HotelsModule {}
