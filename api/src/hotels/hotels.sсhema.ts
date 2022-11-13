import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema({
  timestamps: true,
})
export class Hotel {
  @Prop()
  title: string;

  @Prop()
  description?: string;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
