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
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto';
import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { AssignManyProductsDto } from './dto/assign-many-products.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('members')
@UseGuards(JwtGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Post('/bulkcreate')
  async bulkcreate(
    @Body(new ParseArrayPipe({ items: CreateMemberDto }))
    createMemberDto: CreateMemberDto[],
    @Res() res: Response,
  ) {
    const createdCount = await this.membersService.bulkcreate(createMemberDto);

    res.status(HttpStatus.CREATED).json({
      message: `Bulk create successful: ${createdCount} documents inserted successfully out of ${createMemberDto.length}.`,
    });
  }

  @Post('/assign-many-products')
  async assignManyProducts(
    @Body() assignManyProductsDto: AssignManyProductsDto,
  ) {
    const { memberId, productsIds } = assignManyProductsDto;
    await this.membersService.assignManyProductsToMember(memberId, productsIds);
  }

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseMongoIdPipe) id: ObjectId) {
    return this.membersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: ObjectId,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: ObjectId) {
    return this.membersService.remove(id);
  }
}
