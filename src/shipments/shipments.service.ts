import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Model, ObjectId } from 'mongoose';
import { Shipment } from './schemas/shipment.schema';
import { Member } from 'src/members/schemas/member.schema';

@Injectable()
export class ShipmentsService {
  constructor(
    @Inject('SHIPMENT_MODEL') private shipmentRepository: Model<Shipment>,
    @Inject('MEMBER_MODEL') private memberRepository: Model<Member>,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    const { member } = createShipmentDto;

    const [firstName, lastName] = member.split(' ');

    const memberRecord = await this.memberRepository.findOne({
      firstName: firstName,
      lastName: lastName,
    });

    const memberObject = memberRecord ? memberRecord : null;

    const validOrder = memberObject
      ? { ...createShipmentDto, member: memberObject }
      : null;

    if (!validOrder) {
      throw new BadRequestException('Invalid member.');
    }

    const insertedOrder = await this.shipmentRepository.create(validOrder);

    return insertedOrder ? 1 : 0;
  }

  async bulkCreate(createShipmentDto: CreateShipmentDto[]) {
    const memberNames = createShipmentDto.map((order) => order.member);
    const uniqueMemberNames = [...new Set(memberNames)];

    const members = await this.memberRepository.find({
      $or: uniqueMemberNames.map((fullName) => {
        const [firstName, lastName] = fullName.split(' ');
        return {
          firstName: firstName,
          lastName: lastName,
        };
      }),
    });

    const memberMap = new Map();
    members.forEach((member) => {
      memberMap.set(member.firstName + ' ' + member.lastName, member);
    });

    const ordersWithMembers = createShipmentDto.map((order) => {
      const member = memberMap.get(order.member);
      return { ...order, member: member || null };
    });

    const validOrders = ordersWithMembers.filter((order) => !!order.member);

    const insertedOrders =
      await this.shipmentRepository.insertMany(validOrders);

    return insertedOrders.length;
  }

  async findAll() {
    return await this.shipmentRepository.find();
  }

  async findById(id: ObjectId) {
    const shipment = await this.shipmentRepository.findById(id);

    if (!shipment)
      throw new NotFoundException(`Shipment with id "${id}" not found`);

    return shipment;
  }

  async update(id: ObjectId, updateShipmentDto: UpdateShipmentDto) {
    const { member, ...rest } = updateShipmentDto;

    if (member) {
      const [firstName, lastName] = member.split(' ');
      const memberDocument = await this.memberRepository.findOne({
        firstName,
        lastName,
      });

      if (!memberDocument) {
        throw new NotFoundException(`The member ${member} does not exist.`);
      }

      const updatedOrder = await this.shipmentRepository.findByIdAndUpdate(
        id,
        { member: memberDocument, ...rest },
        { new: true },
      );

      return updatedOrder;
    } else {
      const updatedOrder = await this.shipmentRepository.findByIdAndUpdate(
        id,
        { ...rest },
        { new: true },
      );

      return updatedOrder;
    }
  }

  async remove(id: ObjectId) {
    const { deletedCount } = await this.shipmentRepository.deleteOne({
      _id: id,
    });

    if (deletedCount === 0) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }
  }
}
