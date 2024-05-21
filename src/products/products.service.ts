import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

export interface ProductModel
  extends Model<ProductDocument>,
    SoftDeleteModel<ProductDocument> {}

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_MODEL')
    private readonly productRepository: ProductModel,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return await this.productRepository.create(createProductDto);
  }

  async bulkcreate(createProductDto: CreateProductDto[]) {
    return await this.productRepository.insertMany(createProductDto);
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findById(id: ObjectId) {
    const product = await this.productRepository.findById(id);

    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  // async getAllByIds(productIds: ObjectId[], session?: ClientSession) {
  //   const uniqueProductIds = [...new Set(productIds)];

  //   let query = this.productRepository.find({ _id: { $in: uniqueProductIds } });

  //   if (session) {
  //     query = query.session(session);
  //   }

  //   const products = await query.exec();

  //   if (!products || products.length === 0) {
  //     throw new NotFoundException(`No products found for the provided IDs`);
  //   }

  //   if (products.length !== uniqueProductIds.length) {
  //     const foundProductIds = products.map((product) => product._id);

  //     const notFoundProductIds = productIds.filter((productId) => {
  //       return !foundProductIds.some((foundId) => foundId.equals(productId));
  //     });

  //     throw new NotFoundException(
  //       `Products with IDs ${notFoundProductIds.join(', ')} not found`,
  //     );
  //   }

  //   return products;
  // }

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
    const product = await this.findById(id);

    if (product) {
      product.status = 'Deprecated';
      await product.save();
      await this.productRepository.softDelete({ _id: id });
    }

    return {
      message: `Product with id ${id} has been soft deleted`,
    };
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

  async tableGrouping() {
    return await this.productRepository.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      // Filtramos los atributos para excluir aquellos cuyo key sea "color"
      {
        $addFields: {
          filteredAttributes: {
            $filter: {
              input: '$attributes',
              as: 'attribute',
              cond: { $ne: ['$$attribute.key', 'color'] },
            },
          },
        },
      },
      // Agrupamos por los atributos filtrados
      {
        $group: {
          _id: {
            category: '$category',
            attributes: '$filteredAttributes.value',
            name: { $toLower: '$name' },
          },
          products: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          name: '$_id.name',
          products: 1,
        },
      },
    ]);
  }
}
