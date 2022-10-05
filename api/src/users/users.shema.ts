import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from './users.inteface';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true })
  email: string;

  @Prop()
  passwordHash: string;

  @Prop()
  name: string;

  @Prop()
  contactPhone?: string;

  @Prop({ type: String, enum: Role, default: Role.Client })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
