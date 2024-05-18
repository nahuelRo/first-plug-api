import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Model, ObjectId } from 'mongoose';
import { Member } from './schemas/member.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class MembersService {
  constructor(
    @Inject('MEMBER_MODEL') private memberRepository: Model<Member>,
    private productsService: ProductsService,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    return await this.memberRepository.create(createMemberDto);
  }

  async bulkcreate(createMemberDto: CreateMemberDto[]) {
    return (await this.memberRepository.insertMany(createMemberDto)).length;
  }

  async findAll() {
    return await this.memberRepository.find();
  }

  async findById(id: ObjectId) {
    const member = await this.memberRepository.findById(id);

    if (!member)
      throw new NotFoundException(`Member with id "${id}" not found`);

    return member;
  }

  // async assignManyProductsToMember(
  //   memberId: ObjectId,
  //   productsIds: ObjectId[],
  // ) {
  //   const session = await this.memberRepository.db.startSession();
  //   session.startTransaction();

  //   try {
  //     const member = await this.memberRepository
  //       .findById(memberId)
  //       .session(session);

  //     if (!member) {
  //       throw new Error('Member not found');
  //     }

  //     const productsToDelete = await this.productsService.getAllByIds(
  //       productsIds,
  //       session,
  //     );

  //     await this.productsService.deleteMany(productsIds, session);

  //     if (member.products) {
  //       member.products.push(...productsToDelete);
  //     }

  //     await member.save({ session });

  //     await session.commitTransaction();
  //   } catch (error) {
  //     await session.abortTransaction();
  //     console.log(error);
  //     throw error;
  //   } finally {
  //     session.endSession();
  //   }
  // }

  async update(id: ObjectId, updateMemberDto: UpdateMemberDto) {
    return await this.memberRepository.findByIdAndUpdate(id, updateMemberDto, {
      new: true,
    });
  }

  async remove(id: ObjectId) {
    const { deletedCount } = await this.memberRepository.deleteOne({
      _id: id,
    });

    if (deletedCount === 0) {
      throw new BadRequestException(`Member with id "${id}" not found`);
    }
  }
}
