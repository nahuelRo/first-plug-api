import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { tenantConnectionProvider } from 'src/common/providers/tenant-connection.provider';
import { TenantsController } from './tenants.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Tenant.name,
        schema: TenantSchema,
      },
    ]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService, tenantConnectionProvider, JwtService],
  exports: [TenantsService, tenantConnectionProvider],
})
export class TenantsModule {}
