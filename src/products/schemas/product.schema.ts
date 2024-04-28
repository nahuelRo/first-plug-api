import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PRODUCT_STATUSES } from '../interfaces/product.interface';

@Schema()
export class Product extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: [{ key: String, value: String }] })
  properties: string;

  @Prop({ type: String })
  serialNumber?: string;

  @Prop({ type: Boolean, required: true })
  recoverable: boolean;

  @Prop({ type: String })
  assignedEmail?: string;

  @Prop({ type: String })
  acquisitionDate?: string;

  @Prop({ type: String })
  location?: string;

  @Prop({
    required: true,
    enum: PRODUCT_STATUSES,
  })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
