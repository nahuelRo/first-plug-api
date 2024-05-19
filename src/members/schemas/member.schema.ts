import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

@Schema({ timestamps: true })
export class Member extends Document {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  dateOfBirth: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  dni: string;

  @Prop({ type: String, required: true })
  jobPosition: string;

  @Prop({ type: String, required: true })
  country: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  zipCode: string;

  @Prop({ type: String, required: true })
  timeSlotForDelivery: string;

  @Prop({ type: String })
  additionalInfo?: string;

  @Prop({ type: Array, required: true })
  teams: string[];

  @Prop({ type: [{ type: Product }] })
  products?: Product[];
}

export const MemberSchema = SchemaFactory.createForClass(Member);
