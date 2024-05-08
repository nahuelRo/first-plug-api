import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_MODEL') private productRepository: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return await this.productRepository.create(createProductDto);
  }

  async bulkcreate(createProductDto: CreateProductDto[]) {
    return (await this.productRepository.insertMany(createProductDto)).length;
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findById(id: ObjectId) {
    const product = await this.productRepository.findById(id);

    if (!product)
      throw new NotFoundException(`Product with id "${id}" not found`);

    return product;
  }

  async getAllByIds(productIds: ObjectId[], session?: ClientSession) {
    const uniqueProductIds = [...new Set(productIds)];

    let query = this.productRepository.find({ _id: { $in: uniqueProductIds } });

    if (session) {
      query = query.session(session);
    }

    const products = await query.exec();

    if (!products || products.length === 0) {
      throw new NotFoundException(`No products found for the provided IDs`);
    }

    if (products.length !== uniqueProductIds.length) {
      const foundProductIds = products.map((product) => product._id);

      const notFoundProductIds = productIds.filter((productId) => {
        return !foundProductIds.some((foundId) => foundId.equals(productId));
      });

      throw new NotFoundException(
        `Products with IDs ${notFoundProductIds.join(', ')} not found`,
      );
    }

    return products;
  }

  async update(id: ObjectId, updateProductDto: UpdateProductDto) {
    return await this.productRepository.findByIdAndUpdate(
      id,
      updateProductDto,
      {
        new: true,
      },
    );
  }

  async softDelete(id: ObjectId) {
    const product: any = await this.findById(id);
    if (!product) {
      throw new BadRequestException(`Product with id "${id}" not found`);
    }
    await product.delete();
    product.status = 'Deprecated';
    return await product.save();
  }

  async deleteMany(productIdsToDelete: ObjectId[], session?: ClientSession) {
    let query = this.productRepository.deleteMany({
      _id: { $in: productIdsToDelete },
    });

    if (session) {
      query = query.session(session);
    }

    return query.exec();
  }
}
