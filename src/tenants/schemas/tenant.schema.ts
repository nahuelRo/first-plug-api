import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';
import { Document } from 'mongoose';
@Schema()
export class Tenant extends Document {
  @Prop({ type: String })
  tenantName: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: String, required: false })
  password: string;

  @Prop({ type: String, required: false })
  salt: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

TenantSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await genSalt(10);

    this.salt = salt;
    this.password = await hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});
