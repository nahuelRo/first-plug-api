import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { TenantsMiddleware } from '../common/middlewares/tenants.middleware';
import { tenantModels } from '../common/providers/tenant-models-provider';
import { ProductsModule } from 'src/products/products.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TenantsModule, ProductsModule],
  controllers: [MembersController],
  providers: [MembersService, tenantModels.memberModel, JwtService],
  exports: [MembersService],
})
export class MembersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(MembersController);
  }
}
