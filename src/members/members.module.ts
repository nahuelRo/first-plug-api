import { MiddlewareConsumer, Module, forwardRef } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { TenantsMiddleware } from '../common/middlewares/tenants.middleware';
import { tenantModels } from '../common/providers/tenant-models-provider';
import { JwtService } from '@nestjs/jwt';
import { TeamsModule } from 'src/teams/teams.module';

@Module({
  imports: [TenantsModule, forwardRef(() => TeamsModule)],
  controllers: [MembersController],
  providers: [MembersService, tenantModels.memberModel, JwtService],
  exports: [MembersService, tenantModels.memberModel],
})
export class MembersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(MembersController);
  }
}
