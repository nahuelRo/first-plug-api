import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestException } from '@nestjs/common';
import { MembersService } from 'src/members/members.service';
import { Attribute } from './interfaces/product.interface';

export interface ProductModel
  extends Model<ProductDocument>,
    SoftDeleteModel<ProductDocument> {}

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_MODEL')
    private readonly productRepository: ProductModel,
    private readonly memberService: MembersService,
  ) {}

  private async validateSerialNumber(serialNumber: string) {
    if (!serialNumber || serialNumber.trim() === '') {
      return;
    }
    const productWithSameSerialNumber = await this.productRepository.findOne({
      serialNumber,
    });
    const memberProductWithSameSerialNumber =
      await this.memberService.findProductBySerialNumber(serialNumber);

    if (productWithSameSerialNumber || memberProductWithSameSerialNumber) {
      throw new BadRequestException('Serial Number already exists');
    }
  }

  async create(createProductDto: CreateProductDto) {
    const { assignedEmail, serialNumber, ...rest } = createProductDto;

    if (serialNumber && serialNumber.trim() !== '') {
      await this.validateSerialNumber(serialNumber);
    }

    const createData =
      serialNumber && serialNumber.trim() !== ''
        ? { ...rest, serialNumber }
        : rest;

    if (assignedEmail) {
      const member = await this.memberService.assignProduct(
        assignedEmail,
        createData,
      );

      if (member) {
        return member.products.at(-1);
      }
    }

    return await this.productRepository.create({
      ...createData,
      assignedEmail,
    });
  }

  async bulkcreate(createProductDto: CreateProductDto[]) {
    try {
      for (const product of createProductDto) {
        const { serialNumber } = product;

        if (serialNumber && serialNumber.trim() !== '') {
          await this.validateSerialNumber(serialNumber);
        }
      }

      const createData = createProductDto.map((product) => {
        const { serialNumber, ...rest } = product;

        return serialNumber && serialNumber.trim() !== ''
          ? { ...rest, serialNumber }
          : rest;
      });

      const productsWithoutAssignedEmail = createData.filter(
        (product) => !product.assignedEmail,
      );

      const productsWithAssignedEmail = createData.filter(
        (product) => product.assignedEmail,
      );

      const createPromises = productsWithAssignedEmail.map((product) =>
        this.create(product),
      );

      const insertManyPromise = this.productRepository.insertMany(
        productsWithoutAssignedEmail,
      );

      return await Promise.all([...createPromises, insertManyPromise]);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(`Serial Number already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async tableGrouping() {
    const productsFromRepository = await this.productRepository.find({
      isDeleted: false,
    });

    const productsFromMembers =
      await this.memberService.getAllProductsWithMembers();

    const allProducts = [...productsFromRepository, ...productsFromMembers];

    const productsWithFilteredAttributes = allProducts.map((product) => {
      const {
        _id,
        category,
        name,
        attributes,
        status,
        acquisitionDate,
        assignedEmail,
        assignedMember,
        deleteAt,
        isDeleted,
        lastAssigned,
        location,
        recoverable,
        serialNumber,
      } = product;
      const filteredAttributes = attributes.filter(
        (attribute: Attribute) =>
          attribute.key !== 'color' &&
          attribute.key !== 'keyboardLanguage' &&
          attribute.key !== 'gpu',
      );

      return {
        _id,
        category,
        name,
        attributes,
        status,
        acquisitionDate,
        assignedEmail,
        assignedMember,
        deleteAt,
        isDeleted,
        lastAssigned,
        location,
        recoverable,
        serialNumber,
        filteredAttributes,
      };
    });

    const groupedProducts = productsWithFilteredAttributes.reduce(
      (acc, product) => {
        if (product.category !== 'Merchandising') {
          const key = JSON.stringify({
            category: product.category,
            attributes: product.filteredAttributes
              .sort((a, b) => a.key.localeCompare(b.key))
              .map((atr) => atr.value),
          });

          if (!acc[key]) {
            acc[key] = {
              category: product.category,

              products: [],
            };
          }

          acc[key].products.push(product);
          return acc;
        } else {
          const key = JSON.stringify({
            category: product.category,
            name: product.name,
          });

          if (!acc[key]) {
            acc[key] = {
              category: product.category,
              products: [],
            };
          }

          acc[key].products.push(product);
          return acc;
        }
      },
      {},
    );

    const result = Object.values(groupedProducts);

    // return result;
    // Ordenar los productos: primero los de categoría "Computer" y luego el resto por orden alfabético de categoría

    const sortedResult = result
      // @ts-ignore
      .filter((group) => group.category === 'Computer')
      .concat(
        result
          // @ts-ignore
          .filter((group) => group.category !== 'Computer')
          // @ts-ignore
          .sort((a, b) => a.category.localeCompare(b.category)),
      );

    return sortedResult;
  }

  async findById(id: ObjectId) {
    const product = await this.productRepository.findById(id);

    if (product) {
      if (product.isDeleted) {
        throw new NotFoundException(`Product with id "${id}" not found`);
      }

      return product;
    }

    const memberProduct = await this.memberService.getProductByMembers(id);

    if (memberProduct?.product) {
      if (memberProduct?.product.isDeleted) {
        throw new NotFoundException(`Product with id "${id}" not found`);
      }

      return memberProduct.product;
    }

    throw new NotFoundException(`Product with id "${id}" not found`);
  }

  async update(id: ObjectId, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findById(id);

    if (product) {
      const updatedProduct = await this.productRepository.findByIdAndUpdate(
        id,
        updateProductDto,
        { new: true },
      );

      return updatedProduct;
    }

    const memberProduct = await this.memberService.getProductByMembers(id);

    if (memberProduct?.product) {
      const member = memberProduct.member;
      const productIndex = member.products.findIndex(
        (p) => p!._id!.toString() === id.toString(),
      );

      if (productIndex !== -1) {
        member.products[productIndex] = {
          ...member.products[productIndex],
          ...updateProductDto,
        };
        await member.save();

        return member.products[productIndex];
      }
    }

    throw new NotFoundException(`Product with id "${id}" not found`);
  }

  async softDelete(id: ObjectId) {
    const product = await this.productRepository.findById(id);

    if (product) {
      product.status = 'Deprecated';
      await product.save();
      await this.productRepository.softDelete({ _id: id });

      return {
        message: `Product with id ${id} has been soft deleted`,
      };
    }

    const memberProduct = await this.memberService.getProductByMembers(id);

    if (memberProduct && memberProduct.product) {
      const {
        _id,
        name,
        attributes,
        category,
        assignedEmail,
        assignedMember,
        acquisitionDate,
        deleteAt,
        isDeleted,
        location,
        recoverable,
        serialNumber,
      } = memberProduct.product;

      await this.productRepository.create({
        _id,
        name,
        attributes,
        category,
        assignedEmail,
        assignedMember,
        acquisitionDate,
        deleteAt,
        isDeleted,
        location,
        recoverable,
        serialNumber,
        lastAssigned: memberProduct.member.email,
        status: 'Deprecated',
      });

      await this.productRepository.softDelete({ _id: id });

      const memberId = memberProduct.member._id;
      await this.memberService.deleteProductFromMember(memberId, id);
    }

    return {
      message: `Product with id ${id} has been soft deleted`,
    };
  }
}
