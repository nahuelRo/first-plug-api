import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Member } from '../../members/schemas/member.schema';
import { ORDER_STATUSES, OrderStatus } from '../interfaces/order.interface';
import { Document } from 'mongoose';

@Schema()
export class Order extends Document {
  @Prop({ type: Member, required: true })
  member: Member;

  @Prop({
    required: true,
    enum: ORDER_STATUSES,
    default: 'Order confirmed',
  })
  status: OrderStatus;

  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: String, required: true })
  total: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
