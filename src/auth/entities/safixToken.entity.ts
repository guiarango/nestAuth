import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SafixToken extends Document {
  @Prop({ required: true })
  token: string;
}

export const SafixTokenSchema = SchemaFactory.createForClass(SafixToken);
