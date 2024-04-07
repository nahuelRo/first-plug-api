import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseArrayPipe,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { ObjectId } from 'mongoose';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Res() res: Response) {
    const createdCount = await this.ordersService.create(createOrderDto);

    res.status(HttpStatus.CREATED).json({
      message: `Bulk create successful: ${createdCount} documents inserted successfully.`,
    });
  }

  @Post('/bulkcreate')
  async bulkcreate(
    @Body(new ParseArrayPipe({ items: CreateOrderDto }))
    createOrderDto: CreateOrderDto[],
    @Res() res: Response,
  ) {
    const createdCount = await this.ordersService.bulkCreate(createOrderDto);

    res.status(HttpStatus.CREATED).json({
      message: `Bulk create successful: ${createdCount} documents inserted successfully out of ${createOrderDto.length}.`,
    });
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseMongoIdPipe) id: ObjectId) {
    return this.ordersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: ObjectId,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: ObjectId) {
    return this.ordersService.remove(id);
  }
}
