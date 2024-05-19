import {
  Prop,
  Schema as DecoratorSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document, Schema } from 'mongoose';
import {
  Attribute,
  CATEGORIES,
  Category,
  STATES,
  Status,
} from '../interfaces/product.interface';
import * as mongooseDelete from 'mongoose-delete';

@DecoratorSchema({ timestamps: true })
export class Product extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ enum: CATEGORIES, required: true })
  category: Category;

  @Prop({ type: [{ key: String, value: Schema.Types.Mixed }], required: true })
  attributes: Attribute[];

  @Prop({
    enum: STATES,
    required: true,
  })
  status: Status;

  @Prop({ type: Boolean, required: true })
  recoverable: boolean;

  @Prop({ type: String })
  serialNumber?: string;

  @Prop({ type: String })
  assignedEmail?: string;

  @Prop({ type: String })
  acquisitionDate?: string;

  @Prop({ type: String })
  location?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product).plugin(
  mongooseDelete,
  { overrideMethods: true },
);
