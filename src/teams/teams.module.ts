import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { tenantModels } from '../common/providers/tenant-models-provider';
import { TenantsModule } from 'src/tenants/tenants.module';
import { TenantsMiddleware } from 'src/common/middlewares/tenants.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TenantsModule],
  controllers: [TeamsController],
  providers: [TeamsService, tenantModels.memberModel, JwtService],
})
export class TeamsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(TeamsController);
  }
}
