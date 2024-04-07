import { ORDER_STATUSES, OrderStatus } from "../interfaces/order.interface";
import { IsDateString, IsEnum, IsString, MinLength } from "class-validator";

export class CreateOrderDto {
    
    @IsString()
    @MinLength(1)
    member: string;
    
    @IsEnum(ORDER_STATUSES, {
        message: `status must be one of the following values: ${ORDER_STATUSES.join(', ')}`,
    })
    status: OrderStatus;

    @IsDateString()
    @MinLength(1)
    date: string

    @IsString()
    @MinLength(1)
    total: string
}
