import { ObjectId } from 'mongoose';

export type UserJWT = {
  _id: ObjectId;
  name: string;
  email: string;
  image?: string;
  tenantName: string;
};

export type validatePassword = {
  password: string;
  salt: string;
};
