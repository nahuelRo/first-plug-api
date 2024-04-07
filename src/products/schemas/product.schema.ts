import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PRODUCT_STATUSES } from '../interfaces/product.interface';

@Schema()
export class Product extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, default: '' })
  color?: string;

  @Prop({ type: String, default: '' })
  screen?: string;

  @Prop({ type: String, default: '' })
  keyboard?: string;

  @Prop({ type: String, default: '' })
  processor?: string;

  @Prop({ type: String, default: '' })
  ram?: string;

  @Prop({ type: String, default: '' })
  storage?: string;

  @Prop({ type: String, default: '' })
  gpu?: string;

  @Prop({ type: String, default: '' })
  serialNumber?: string;

  @Prop({
    required: true,
    enum: PRODUCT_STATUSES,
    default: 'Available',
  })
  status: string;

  @Prop({ type: String, default: '' })
  imgUrl?: string;

  @Prop({ type: Number, required: true, default: 1 })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
