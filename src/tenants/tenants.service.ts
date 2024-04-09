import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Tenant } from './schemas/tenant.schema';
import { CreateTenantDto, UpdateTenantDto } from './dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private tenantRepository: Model<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    await this.findByEmail(createTenantDto.email);
    await this.tenantRepository.create(createTenantDto);
  }

  async getByTenantName(tenantName: string) {
    return await this.tenantRepository.findOne({ tenantName });
  }

  async findByEmail(email: string) {
    const user = await this.tenantRepository.findOne({ email });

    if (user) {
      throw new BadRequestException(
        'The credentials are not valid, please try again.',
      );
    }

    return user;
  }

  async update(userId: ObjectId, updateTenantDto: UpdateTenantDto) {
    return this.tenantRepository.findByIdAndUpdate(userId, updateTenantDto);
  }
}
