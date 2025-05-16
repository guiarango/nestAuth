import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  userDocument: string;
  @Prop({ required: true, unique: true, index: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  names: string;
  @Prop({ required: true })
  lastNames: string;
  @Prop({ required: true })
  isActive: boolean;
  @Prop({ required: true })
  areas: string[];
  @Prop({ required: true })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
