import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Model, ObjectId } from 'mongoose';
import { MemberDocument } from './schemas/member.schema';
import { ProductsService } from '../products/products.service';
import { CreateMemberArrayDto } from './dto/create-member-array.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

export interface MemberModel
  extends Model<MemberDocument>,
    SoftDeleteModel<MemberDocument> {}

@Injectable()
export class MembersService {
  constructor(
    @Inject('MEMBER_MODEL') private memberRepository: MemberModel,
    private productsService: ProductsService,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    try {
      return await this.memberRepository.create(createMemberDto);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async bulkcreate(createMemberDto: CreateMemberArrayDto) {
    try {
      return await this.memberRepository.insertMany(createMemberDto);
    } catch (error) {
      this.handleDBExceptions(error);
    }
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

  async findByEmail(email: string) {
    const member = await this.memberRepository.find({ email: email });

    if (!member)
      throw new NotFoundException(`Member with email "${email}" not found`);

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

  async softDelete(id: ObjectId) {
    const product = await this.findById(id);

    if (product) {
      await product.save();
      await this.memberRepository.softDelete({ _id: id });
    }

    return {
      message: `Product with id ${id} has been soft deleted`,
    };
  }

  private handleDBExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Email is already in use`);
    }

    throw new InternalServerErrorException(
      'Unexcepted error, check server log',
    );
  }
}
