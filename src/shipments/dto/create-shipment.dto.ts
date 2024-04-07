import { IsEnum, IsString, MinLength } from 'class-validator';
import {
  SHIPMENT_STATUS,
  SHIPMENT_TYPE,
  ShipmentStatus,
  ShipmentType,
} from '../interfaces/shipment.interface';

export class CreateShipmentDto {
  @IsString()
  @MinLength(1)
  member: string;

  @IsString()
  @MinLength(1)
  date: string;

  @IsEnum(SHIPMENT_TYPE)
  type: ShipmentType;

  @IsString()
  @MinLength(1)
  trackingNumber: string;

  @IsString()
  @MinLength(1)
  trackingURL: string;

  @IsString()
  @MinLength(1)
  price: string;

  @IsEnum(SHIPMENT_STATUS)
  status: ShipmentStatus;
}
