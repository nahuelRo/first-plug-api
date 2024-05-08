import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  CATEGORIES,
  Category,
  Key,
  STATES,
  Status,
} from '../interfaces/product.interface';
import * as mongooseTimestamp from 'mongoose-timestamp';
import * as mongooseDelete from 'mongoose-delete';

@Schema()
export class Product extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ enum: CATEGORIES, required: true })
  category: Category;

  @Prop({ type: [{ key: String, value: String }] })
  attributes: Array<{ key: Key; value: string }>;

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
    enum: STATES,
  })
  status: Status;
}

export const ProductSchema = SchemaFactory.createForClass(Product)
  .plugin(mongooseTimestamp)
  .plugin(mongooseDelete, { overrideMethods: true, deletedAt: true });
