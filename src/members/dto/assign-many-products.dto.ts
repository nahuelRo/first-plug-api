import { IsArray, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class AssignManyProductsDto {
  @IsMongoId()
  memberId: ObjectId;

  @IsArray()
  @IsMongoId({ each: true })
  productsIds: ObjectId[];
}
