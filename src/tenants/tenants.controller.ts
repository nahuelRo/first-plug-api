import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateTenantInformationSchemaDto } from './dto/update-information.dto';
import { TenantsService } from './tenants.service';
import { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('user')
export class TenantsController {
  constructor(private readonly tenantService: TenantsService) {}

  @Patch()
  async update(
    @Req() request: Request,
    @Body() updateTenantInformationSchemaDto: UpdateTenantInformationSchemaDto,
  ) {
    return await this.tenantService.updateInformation(
      request.user,
      updateTenantInformationSchemaDto,
    );
  }
}
