import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { UpdateProductDto } from './dto/update-product.dto';
import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('products')
@UseGuards(JwtGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('/bulkcreate')
  async bulkcreate(
    @Body(new ParseArrayPipe({ items: CreateProductDto }))
    createProductDto: CreateProductDto[],
    @Res() res: Response,
  ) {
    const createdCount =
      await this.productsService.bulkcreate(createProductDto);

    res.status(HttpStatus.CREATED).json({
      message: `Bulk create successful: ${createdCount} documents inserted successfully out of ${createProductDto.length}.`,
    });
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseMongoIdPipe) id: ObjectId) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: ObjectId,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: ObjectId) {
    return this.productsService.softDelete(id);
  }
}
