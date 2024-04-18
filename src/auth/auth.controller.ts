import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateTenantDto } from '../tenants/dto';
import { TenantsService } from '../tenants/tenants.service';
import { LoginDto } from './dto/auth.dto';
import { RefreshJwtGuard } from './guard/refresh.guard';
import { Request } from 'express';
import { JwtGuard } from './guard/jwt.guard';
import { validatePassword } from './interfaces/auth.interface';
import { CreateTenantByProvidersDto } from 'src/tenants/dto/create-tenant-by-providers.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantService: TenantsService,
  ) {}

  @Post('register')
  async registerUser(@Body() createTenantDto: CreateTenantDto) {
    return await this.tenantService.create(createTenantDto);
  }

  @Post('register-providers')
  async registerByProviders(
    @Body() createTenantByProvidersDto: CreateTenantByProvidersDto,
  ) {
    return await this.tenantService.createByProviders(
      createTenantByProvidersDto,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('get-tokens')
  async getTokens(
    @Body() createTenantByProvidersDto: CreateTenantByProvidersDto,
  ) {
    return await this.authService.getTokens(createTenantByProvidersDto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Req() req) {
    return await this.authService.refreshToken(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() loginDto: validatePassword,
  ) {
    return await this.authService.changePassword(
      req.user._id,
      loginDto.password,
    );
  }
}
