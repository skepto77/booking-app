import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { IdValidationPipe } from 'src/pipes/idValidation.pipe';
import { Role } from 'src/users/users.inteface';
import { createHotelDto } from './dto/createHotel.dto';
import { createRoomDto } from './dto/createRoom.dto';
import { updateHotelDto } from './dto/updateHotel.dto';
import { updateRoomDto } from './dto/updateRoom.dto';
import {
  IHotel,
  SearchHotelsParams,
  SearchRoomsParams,
} from './hotels.interface';
import { HotelRoomService } from './room.service';
import { HotelsService } from './hotels.service';
import { FileSizeValidationPipe } from './pipes/fileSizeExtValidation.pipe';

@Controller()
export class HotelsController {
  constructor(
    private readonly hotelService: HotelsService,
    private readonly roomsService: HotelRoomService,
  ) {}

  @Post('admin/hotels')
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  async create(@Body() data: createHotelDto) {
    const hotel: IHotel = await this.hotelService.create(data);
    return this.hotelService.buildHotelResponse(hotel);
  }

  @Get('admin/hotels')
  @Roles(Role.Admin)
  async search(@Query() query: SearchHotelsParams) {
    return await this.hotelService.search(query);
  }

  @Put('admin/hotels/:id')
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  async updateHotel(@Param() id: string, @Body() data: updateHotelDto) {
    const hotel: any = this.hotelService.updateHotel(id, data);
    return this.hotelService.buildHotelResponse(hotel);
  }

  @Get('common/hotel-rooms')
  async getRoom(@Query() params: SearchRoomsParams) {
    return await this.roomsService.find(params);
  }

  @Get('common/hotel-rooms/:id')
  async searchRoom(@Param() params) {
    return await this.roomsService.findById(params);
  }

  @Post('admin/hotel-rooms/')
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 20))
  async createRoom(
    @UploadedFiles(new FileSizeValidationPipe())
    images: Array<Express.Multer.File>,
    @Body() data: createRoomDto,
  ) {
    return await this.roomsService.create(images, data);
  }

  @Put('admin/hotel-rooms/:id')
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 20))
  async updateRoom(
    @Param('id', IdValidationPipe) id: string,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Array<Express.Multer.File>,
    @Body() data: updateRoomDto,
  ) {
    return await this.roomsService.update(images, data, id);
  }
}
