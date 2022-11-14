import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type HotelRoomDocument = HotelRoom & Document;

@Schema({
  timestamps: true,
})
export class HotelRoom {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' })
  hotel: mongoose.Schema.Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ default: [] })
  images?: string[];

  @Prop({ default: true })
  isEnabled: boolean;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);
