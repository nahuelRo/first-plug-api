import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  SHIPMENT_STATUS,
  SHIPMENT_TYPE,
  ShipmentStatus,
  ShipmentType,
} from '../interfaces/shipment.interface';
import { Member } from 'src/members/schemas/member.schema';

@Schema({ timestamps: true })
export class Shipment extends Document {
  @Prop({ type: Member, required: true })
  member: Member;

  @Prop({ type: String, required: true })
  date: string;

  @Prop({
    required: true,
    enum: SHIPMENT_TYPE,
    default: 'Preparing',
  })
  type: ShipmentType;

  @Prop({ type: String, required: true })
  trackingNumber: string;

  @Prop({ type: String, required: true })
  trackingURL: string;

  @Prop({ type: String, required: true })
  price: string;

  @Prop({
    required: true,
    enum: SHIPMENT_STATUS,
    default: 'Preparing',
  })
  status: ShipmentStatus;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
