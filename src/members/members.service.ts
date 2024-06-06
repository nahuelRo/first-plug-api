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

import { CreateMemberArrayDto } from './dto/create-member-array.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateProductDto } from 'src/products/dto';

export interface MemberModel
  extends Model<MemberDocument>,
    SoftDeleteModel<MemberDocument> {}

@Injectable()
export class MembersService {
  constructor(@Inject('MEMBER_MODEL') private memberRepository: MemberModel) {}

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
    const member = await this.memberRepository.findOne({ email: email });

    if (!member)
      throw new NotFoundException(`Member with email "${email}" not found`);

    return member;
  }

  async findByEmailNotThrowError(email: string) {
    return await this.memberRepository.findOne({ email: email });
  }

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

  async findProductBySerialNumber(serialNumber: string) {
    if (!serialNumber || serialNumber.trim() === '') {
      return null;
    }
    const member = await this.memberRepository.findOne({
      'products.serialNumber': serialNumber,
    });
    return member
      ? member.products.find((product) => product.serialNumber === serialNumber)
      : null;
  }

  async assignProduct(email: string, createProductDto: CreateProductDto) {
    const member = await this.findByEmailNotThrowError(email);

    if (member) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { assignedEmail, serialNumber, ...rest } = createProductDto;

      const productData =
        serialNumber && serialNumber.trim() !== ''
          ? { ...rest, serialNumber }
          : rest;

      productData.assignedMember = `${member.firstName} ${member.lastName}`;
      member.products.push(productData);
      member.save();
    }

    return member;
  }

  async getAllProductsWithMembers() {
    const members = await this.memberRepository.find();

    return members.flatMap((member) => member.products || []);
  }

  async getProductByMembers(id: ObjectId) {
    const members = await this.memberRepository.find();

    for (const member of members) {
      const products = member.products || [];
      const product = products.find(
        (product) => product._id!.toString() === id.toString(),
      );

      if (product) {
        return { member, product };
      }
    }
  }

  async deleteProductFromMember(memberId: ObjectId, productId: ObjectId) {
    try {
      const member = await this.memberRepository.findById(memberId);

      if (!member) {
        throw new Error(`Member with id ${memberId} not found`);
      }

      member.products = member.products.filter(
        (product) => product!._id!.toString() !== productId.toString(),
      );

      await member.save();
    } catch (error) {
      console.error('Error while deleting product from member:', error);
      throw error;
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Email is already in use`);
    }

    throw new InternalServerErrorException(
      'Unexcepted error, check server log',
    );
  }

  async removeProductFromMember(
    email: string,
    productId: ObjectId,
    session: any,
  ) {
    console.log(`Removing product ${productId} from member ${email}`);
    const member = await this.memberRepository
      .findOne({ email: email })
      .session(session);
    if (member) {
      member.products = member.products.filter(
        (product) =>
          product._id && product._id.toString() !== productId.toString(),
      );
      await member.save();
    } else {
      console.error(`Member with email ${email} not found.`);
    }
  }

  async addProductToMember(email: string, productData: any, session: any) {
    console.log(`Adding product to member ${email}`, productData);
    const member = await this.memberRepository
      .findOne({ email: email })
      .session(session);
    if (member) {
      member.products.push(productData);
      await member.save();
    } else {
      console.error(`Member with email ${email} not found.`);
    }
  }

  async updateProductInMember(
    email: string,
    productId: ObjectId,
    updateProductDto: any,
    session: any,
  ) {
    const member = await this.memberRepository
      .findOne({ email: email })
      .session(session);
    if (member) {
      const productIndex = member.products.findIndex(
        (p) => p._id!.toString() === productId.toString(),
      );
      if (productIndex !== -1) {
        member.products[productIndex] = {
          ...member.products[productIndex],
          ...updateProductDto,
        };
        await member.save();
      }
    }
  }
}
