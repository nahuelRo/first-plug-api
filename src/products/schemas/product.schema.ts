import {
  Prop,
  Schema as DecoratorSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Document, Schema, SchemaTimestampsConfig } from 'mongoose';
import {
  Attribute,
  CATEGORIES,
  Category,
  STATES,
  Status,
} from '../interfaces/product.interface';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';

export type ProductDocument = Product & Document & SchemaTimestampsConfig;

@DecoratorSchema({ timestamps: true })
export class Product {
  @Prop({
    type: String,
    validate: {
      validator: function (value: string) {
        return (
          this.category !== 'Merchandising' ||
          (this.category === 'Merchandising' &&
            value &&
            value.trim().length > 0)
        );
      },
      message: 'Name is required for Merchandising category.',
    },
  })
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

  isDeleted: boolean;

  deleteAt?: string | null;
}

export const ProductSchema =
  SchemaFactory.createForClass(Product).plugin(softDeletePlugin);
