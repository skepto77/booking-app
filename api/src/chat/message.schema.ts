import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
})
export class Message {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, default: new Date() })
  sentAt: Date;

  @Prop({ required: true })
  text: string;

  @Prop({ default: null })
  readAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
