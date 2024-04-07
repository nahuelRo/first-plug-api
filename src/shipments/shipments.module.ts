import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { TenantsModule } from 'src/tenants/tenants.module';
import { tenantModels } from 'src/common/providers/tenant-models-provider';
import { TenantsMiddleware } from 'src/common/middlewares/tenants.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TenantsModule],
  controllers: [ShipmentsController],
  providers: [
    ShipmentsService,
    tenantModels.shipmentModel,
    tenantModels.memberModel,
    JwtService,
  ],
})
export class ShipmentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(ShipmentsController);
  }
}
