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
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface ProductModel
  extends Model<ProductDocument>,
    SoftDeleteModel<ProductDocument> {}

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_MODEL')
    private readonly productRepository: ProductModel,
    private readonly memberService: MembersService,
    @InjectConnection() private readonly connection: Connection,
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
      const productsWithSerialNumbers = createProductDto.filter(
        (product) => product.serialNumber,
      );
      const seenSerialNumbers = new Set<string>();
      const duplicates = new Set<string>();

      productsWithSerialNumbers.forEach((product) => {
        if (product.serialNumber) {
          if (seenSerialNumbers.has(product.serialNumber)) {
            duplicates.add(product.serialNumber);
          } else {
            seenSerialNumbers.add(product.serialNumber);
          }
        }
      });

      if (duplicates.size > 0) {
        throw new BadRequestException(`Serial Number already exists`);
      }

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
      // @ts-expect-error as @ts-ignore
      .filter((group) => group.category === 'Computer')
      .concat(
        result
          // @ts-expect-error as @ts-ignore
          .filter((group) => group.category !== 'Computer')
          // @ts-expect-error as @ts-ignore
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
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const product = await this.productRepository
        .findById(id)
        .session(session);

      if (product) {
        // Asigno un producto de Products a un miembro de Members
        if (
          updateProductDto.assignedEmail &&
          updateProductDto.assignedEmail !== 'none' &&
          updateProductDto.assignedEmail !== ''
        ) {
          const newMember = await this.memberService.findByEmail(
            updateProductDto.assignedEmail,
            session,
          );

          if (!newMember) {
            throw new NotFoundException(
              `Member with email "${updateProductDto.assignedEmail}" not found`,
            );
          }

          if (product.assignedEmail && product.assignedEmail !== 'none') {
            const currentMember = await this.memberService.findByEmail(
              product.assignedEmail,
              session,
            );

            if (currentMember) {
              currentMember.products = currentMember.products.filter(
                (prod) => prod._id?.toString() !== id.toString(),
              );
              await currentMember.save({ session });
            }
          }

          newMember.products.push({
            _id: product._id,
            name: product.name,
            category: product.category,
            attributes: product.attributes,
            status: updateProductDto.status || product.status,
            recoverable: product.recoverable,
            assignedEmail: updateProductDto.assignedEmail,
            assignedMember: updateProductDto.assignedMember,
            acquisitionDate: product.acquisitionDate,
            location: updateProductDto.location || product.location,
            isDeleted: product.isDeleted,
            lastAssigned: product.assignedMember,
          });
          await newMember.save({ session });

          await this.productRepository.findByIdAndDelete(id).session(session);
          // Desasigno un producto de members para enviarlo a products
        } else if (
          updateProductDto.assignedEmail === 'none' ||
          updateProductDto.assignedEmail === ''
        ) {
          console.log('Desasignar producto:', product);
          if (product.assignedEmail && product.assignedEmail !== 'none') {
            const currentMember = await this.memberService.findByEmail(
              product.assignedEmail,
              session,
            );

            if (currentMember) {
              currentMember.products = currentMember.products.filter(
                (prod) => prod._id?.toString() !== id.toString(),
              );
              await currentMember.save({ session });
            }
          }

          await this.productRepository.create(
            [
              {
                _id: product._id,
                name: product.name,
                category: product.category,
                attributes: product.attributes,
                status: updateProductDto.status || product.status,
                recoverable: product.recoverable,
                assignedEmail: 'none',
                assignedMember: '',
                lastAssigned: product.assignedMember,
                acquisitionDate: product.acquisitionDate,
                location: updateProductDto.location || product.location,
                isDeleted: product.isDeleted,
              },
            ],
            { session },
          );
          // Actualizar producto en products
        } else {
          await this.productRepository.updateOne(
            { _id: id },
            { $set: updateProductDto },
            { session, runValidators: true, new: true, omitUndefined: true },
          );
        }

        await session.commitTransaction();
        session.endSession();

        return { message: `Product with id "${id}" updated successfully` };
      }

      const memberProduct = await this.memberService.getProductByMembers(
        id,
        session,
      );

      if (memberProduct?.product) {
        const member = memberProduct.member;
        const productIndex = member.products.findIndex(
          (prod) => prod._id!.toString() === id.toString(),
        );

        if (productIndex !== -1) {
          const currentProduct = member.products[productIndex];

          const plainCurrentProduct = {
            _id: currentProduct._id,
            name: currentProduct.name,
            category: currentProduct.category,
            attributes: currentProduct.attributes,
            status: currentProduct.status,
            recoverable: currentProduct.recoverable,
            assignedEmail: currentProduct.assignedEmail,
            assignedMember: currentProduct.assignedMember,
            acquisitionDate: currentProduct.acquisitionDate,
            location: currentProduct.location,
            isDeleted: currentProduct.isDeleted,
          };

          // Reasignar producto entre members

          if (
            updateProductDto.assignedEmail &&
            updateProductDto.assignedEmail !== 'none' &&
            updateProductDto.assignedEmail !== ''
          ) {
            const newMember = await this.memberService.findByEmail(
              updateProductDto.assignedEmail,
              session,
            );

            if (!newMember) {
              throw new NotFoundException(
                `Member with email "${updateProductDto.assignedEmail}" not found`,
              );
            }

            member.products.splice(productIndex, 1);
            await member.save({ session });

            newMember.products.push({
              ...plainCurrentProduct,
              assignedEmail: updateProductDto.assignedEmail,
              assignedMember: updateProductDto.assignedMember,
              status: updateProductDto.status || plainCurrentProduct.status,
              location:
                updateProductDto.location || plainCurrentProduct.location,
              lastAssigned: plainCurrentProduct.assignedMember,
            });
            await newMember.save({ session });

            await session.commitTransaction();
            session.endSession();

            return {
              message: `Product with id "${id}" reassigned successfully`,
            };
            //  desasignar producto de members a products
          } else if (
            updateProductDto.assignedEmail === 'none' ||
            updateProductDto.assignedEmail === ''
          ) {
            member.products.splice(productIndex, 1);
            await member.save({ session });

            await this.productRepository.create(
              [
                {
                  ...plainCurrentProduct,
                  lastAssigned: plainCurrentProduct.assignedMember,
                  assignedEmail: 'none',
                  assignedMember: '',
                  status: updateProductDto.status || plainCurrentProduct.status,
                  location:
                    updateProductDto.location || plainCurrentProduct.location,
                },
              ],
              { session },
            );

            await session.commitTransaction();
            session.endSession();

            return {
              message: `Product with id "${id}" unassigned successfully`,
            };
            // Actualizar producto en members
          } else {
            Object.assign(member.products[productIndex], updateProductDto);
            await member.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { message: `Product with id "${id}" updated successfully` };
          }
        }
      }

      throw new NotFoundException(`Product with id "${id}" not found`);
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
      throw error;
    }
  }

  async softDelete(id: ObjectId) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const product = await this.productRepository
        .findById(id)
        .session(session);

      if (product) {
        product.status = 'Deprecated';
        await product.save();
        await this.productRepository.softDelete({ _id: id }, { session });

        await session.commitTransaction();
        session.endSession();

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

        await this.productRepository.create(
          [
            {
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
            },
          ],
          { session },
        );

        await this.productRepository.softDelete({ _id: id }, { session });

        const memberId = memberProduct.member._id;
        await this.memberService.deleteProductFromMember(memberId, id);

        await session.commitTransaction();
        session.endSession();

        return {
          message: `Product with id ${id} has been soft deleted`,
        };
      }
      throw new NotFoundException(`Product with id "${id}" not found`);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
