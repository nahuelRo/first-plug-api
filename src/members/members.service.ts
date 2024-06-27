import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ClientSession, Connection, Model, ObjectId, Schema } from 'mongoose';
import { MemberDocument } from './schemas/member.schema';
// import { CreateMemberArrayDto } from './dto/create-member-array.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateProductDto } from 'src/products/dto';
import { Team } from 'src/teams/schemas/team.schema';
import { ProductModel } from 'src/products/products.service';
import { InjectConnection } from '@nestjs/mongoose';

export interface MemberModel
  extends Model<MemberDocument>,
    SoftDeleteModel<MemberDocument> {}

@Injectable()
export class MembersService {
  constructor(
    @Inject('MEMBER_MODEL') private memberRepository: MemberModel,
    @Inject('PRODUCT_MODEL') private productRepository: ProductModel,
    @Inject('TEAM_MODEL') private teamRepository: Model<Team>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private normalizeTeamName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private normalizeMemberData(member: CreateMemberDto) {
    return {
      ...member,
      email: member.email.toLowerCase(),
      firstName: member.firstName
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      lastName: member.lastName
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    };
  }

  private getFullName(member: any): string {
    if (member && member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    return '';
  }

  private async assignProductsToMemberByEmail(
    memberEmail: string,
    memberFullName: string,
    session: ClientSession,
  ) {
    const productsToUpdate = await this.productRepository
      .find({ assignedEmail: memberEmail })
      .session(session);

    for (const product of productsToUpdate) {
      product.assignedMember = memberFullName;
      await product.save({ session });
      await this.productRepository
        .deleteOne({ _id: product._id })
        .session(session);
    }

    return productsToUpdate;
  }

  async create(createMemberDto: CreateMemberDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const normalizedMember = this.normalizeMemberData(createMemberDto);
      const createdMember = (
        await this.memberRepository.create([normalizedMember], { session })
      )[0];

      const memberFullName = this.getFullName(createdMember);
      const assignedProducts = await this.assignProductsToMemberByEmail(
        normalizedMember.email,
        memberFullName,
        session,
      );

      createdMember.products.push(...assignedProducts);
      await createdMember.save({ session });

      await session.commitTransaction();
      session.endSession();
      return createdMember;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.handleDBExceptions(error);
    }
  }

  async bulkCreate(createMemberDtos: CreateMemberDto[]) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const normalizedMembers = createMemberDtos.map(this.normalizeMemberData);

      const emails = normalizedMembers.map((member) => member.email);

      const existingMembers = await this.memberRepository.find({
        email: { $in: emails },
      });
      if (existingMembers.length > 0) {
        throw new BadRequestException(
          `Members with emails "${existingMembers.map((member) => member.email).join(', ')}" already exist`,
        );
      }

      const teamNames = normalizedMembers
        .map((member) =>
          member.team ? this.normalizeTeamName(member.team) : undefined,
        )
        .filter((team) => team && team.trim() !== '');

      const uniqueTeamNames = [...new Set(teamNames)];

      const existingTeams = await this.teamRepository.find({
        name: { $in: uniqueTeamNames },
      });
      const teamMap = new Map<string, Schema.Types.ObjectId>();

      existingTeams.forEach((team) => {
        teamMap.set(team.name, team._id);
      });

      const membersToCreate = await Promise.all(
        normalizedMembers.map(async (member) => {
          if (member.team) {
            const normalizedTeamName = this.normalizeTeamName(member.team);
            if (normalizedTeamName && normalizedTeamName.trim() !== '') {
              if (!teamMap.has(normalizedTeamName)) {
                const newTeam = new this.teamRepository({
                  name: normalizedTeamName,
                });
                const savedTeam = await newTeam.save();
                teamMap.set(savedTeam.name, savedTeam._id);
              }
              const teamId = teamMap.get(normalizedTeamName);
              if (teamId) {
                member.team = teamId.toString();
              }
            }
          }
          return member;
        }),
      );

      const createdMembers = await this.memberRepository.insertMany(
        membersToCreate,
        { session },
      );

      for (const member of createdMembers) {
        const fullName = this.getFullName(member);
        const productsToUpdate = await this.productRepository.find({
          assignedEmail: member.email,
        });

        for (const product of productsToUpdate) {
          product.assignedMember = fullName;
          await product.save({ session });
        }

        member.products.push(...productsToUpdate);
        await member.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return createdMembers;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Bulk create of members error:', error);
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Error creating members');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findAll() {
    try {
      const members = await this.memberRepository.find().populate('team');
      return members;
    } catch (error) {
      console.error('Error while querying the database:', error);
      throw new InternalServerErrorException('Error while fetching members');
    }
  }

  async findById(id: ObjectId) {
    const member = await this.memberRepository.findById(id).populate('team');

    if (!member)
      throw new NotFoundException(`Member with id "${id}" not found`);

    return member;
  }

  async findByEmail(email: string, session?: ClientSession) {
    const member = await this.memberRepository
      .findOne({ email: email })
      .session(session || null);

    if (!member)
      throw new NotFoundException(`Member with email "${email}" not found`);

    return member;
  }

  async findByEmailNotThrowError(
    email: string,
  ): Promise<MemberDocument | null> {
    try {
      const member = await this.memberRepository.findOne({ email }).exec();
      if (member) {
        return member;
      }

      const product = await this.productRepository
        .findOne({ assignedEmail: email })
        .exec();
      if (product) {
        return null;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async update(id: ObjectId, updateMemberDto: UpdateMemberDto) {
    try {
      const member = await this.memberRepository.findById(id);
      if (!member) {
        throw new NotFoundException(`Member with id "${id}" not found`);
      }

      if (updateMemberDto.products && updateMemberDto.products.length > 0) {
        member.products = updateMemberDto.products;
      } else {
        delete updateMemberDto.products;
      }

      Object.assign(member, updateMemberDto);

      return await member.save();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async softDeleteMember(id: ObjectId) {
    const member = await this.findById(id);

    if (!member) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }

    const hasRecoverableProducts = member.products.some(
      (product) => product.recoverable,
    );
    const hasNonRecoverableProducts = member.products.some(
      (product) => !product.recoverable,
    );

    if (hasRecoverableProducts) {
      throw new BadRequestException(
        'Cannot delete a member with recoverable products assigned. Please unassign the products first.',
      );
    }

    if (hasNonRecoverableProducts) {
      member.products.forEach((product) => {
        if (!product.recoverable) {
          product.status = 'Deprecated';
          product.isDeleted = true;
        }
      });
    }

    member.$isDeleted(true);
    await member.save();

    await this.memberRepository.softDelete({ _id: id });

    return {
      message: `Member with id ${id} has been soft deleted`,
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

  async assignProduct(
    email: string,
    createProductDto: CreateProductDto,
    session?: ClientSession,
  ) {
    const member = await this.findByEmailNotThrowError(email);

    if (member) {
      const { serialNumber, ...rest } = createProductDto;

      const productData =
        serialNumber && serialNumber.trim() !== ''
          ? { ...rest, serialNumber }
          : rest;

      productData.assignedMember = `${member.firstName} ${member.lastName}`;
      member.products.push(productData);
      await member.save({ session });
    }

    return member;
  }

  async getAllProductsWithMembers() {
    const members = await this.memberRepository.find();

    return members.flatMap((member) => member.products || []);
  }

  async getProductByMembers(id: ObjectId, session?: ClientSession) {
    const members = await this.memberRepository.find().session(session || null);

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

  async deleteProductFromMember(
    memberId: ObjectId,
    productId: ObjectId,
    session?: ClientSession,
  ) {
    try {
      const member = await this.memberRepository
        .findById(memberId)
        .session(session || null);

      if (!member) {
        throw new Error(`Member with id ${memberId} not found`);
      }

      member.products = member.products.filter(
        (product) => product?._id?.toString() !== productId.toString(),
      );

      await member.save({ session });
    } catch (error) {
      console.error('Error while deleting product from member:', error);
      throw error;
    }
  }

  async findMembersByTeam(teamId: ObjectId) {
    try {
      const members = await this.memberRepository
        .find({ team: teamId })
        .populate('team');
      if (!members || members.length === 0) {
        throw new NotFoundException(
          `Members with team id "${teamId}" not found`,
        );
      }
      return members;
    } catch (error) {
      this.handleDBExceptions(error);
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
}
