import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { Order } from './schemas/order.schema';
import { Member } from '../members/schemas/member.schema';

@Injectable()
export class OrdersService {
  // TODO: It remains to change import the service and not the repository
  constructor(
    @Inject('ORDER_MODEL') private orderRepository: Model<Order>,
    @Inject('MEMBER_MODEL') private memberRepository: Model<Member>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { member } = createOrderDto;

    const [firstName, lastName] = member.split(' ');

    const memberRecord = await this.memberRepository.findOne({
      firstName: firstName,
      lastName: lastName,
    });

    const memberObject = memberRecord ? memberRecord : null;

    const validOrder = memberObject
      ? { ...createOrderDto, member: memberObject }
      : null;

    if (!validOrder) {
      throw new BadRequestException('Invalid member.');
    }

    const insertedOrder = await this.orderRepository.create(validOrder);

    return insertedOrder ? 1 : 0;
  }

  async bulkCreate(createOrderDto: CreateOrderDto[]) {
    const memberNames = createOrderDto.map((order) => order.member);
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

    const ordersWithMembers = createOrderDto.map((order) => {
      const member = memberMap.get(order.member);
      return { ...order, member: member || null };
    });

    const validOrders = ordersWithMembers.filter((order) => !!order.member);

    const insertedOrders = await this.orderRepository.insertMany(validOrders);

    return insertedOrders.length;
  }

  async findAll() {
    return await this.orderRepository.find();
  }

  async findById(id: ObjectId) {
    const order = await this.orderRepository.findById(id);

    if (!order) throw new NotFoundException(`Order with id "${id}" not found`);

    return order;
  }

  async update(id: ObjectId, updateOrderDto: UpdateOrderDto) {
    const { member, ...rest } = updateOrderDto;
    let updatedOrder: Model<Member>;

    if (member) {
      const [firstName, lastName] = member.split(' ');
      const memberDocument = await this.memberRepository.findOne({
        firstName,
        lastName,
      });

      if (!memberDocument) {
        throw new NotFoundException(`The member ${member} does not exist.`);
      }

      updatedOrder = await this.orderRepository.findByIdAndUpdate(
        id,
        { member: memberDocument, ...rest },
        { new: true },
      );
    } else {
      updatedOrder = await this.orderRepository.findByIdAndUpdate(
        id,
        { ...rest },
        { new: true },
      );
    }

    return updatedOrder;
  }

  async remove(id: ObjectId) {
    const { deletedCount } = await this.orderRepository.deleteOne({
      _id: id,
    });

    if (deletedCount === 0) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }
  }
}
