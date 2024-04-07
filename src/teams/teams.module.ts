import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { tenantModels } from '../common/providers/tenant-models-provider';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [TeamsController],
  providers: [TeamsService, tenantModels.memberModel],
})
export class TeamsModule {}
