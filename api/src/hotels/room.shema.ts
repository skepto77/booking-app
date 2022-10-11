import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { SchemaTypes } from 'mongoose';
import { ID } from 'src/types/common.types';
import { Hotel } from './hotels.shema';

export type HotelRoomDocument = HotelRoom & Document;

@Schema({
  timestamps: true,
})
export class HotelRoom {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' })
  hotel: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: [] })
  images?: string[];

  @Prop({ default: true })
  isEnabled: boolean;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);
