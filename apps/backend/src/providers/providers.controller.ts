import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import {
  RegisterProviderDto,
  AddPracticeDto,
  VerifyCredentialDto,
  VerifyBankAccountDto,
  CreateContractDto,
  AssignNetworkDto,
  GrantAuthorisationDto,
} from './dto'

@Controller('api/v1/providers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  /**
   * Register a new provider
   */
  @Post('register')
  @RequirePermissions('providers:write')
  async registerProvider(@Body() dto: RegisterProviderDto, @Request() req: any) {
    return this.providersService.registerProvider(dto, req.user.userId)
  }

  /**
   * Get all providers
   */
  @Get()
  @RequirePermissions('providers:read')
  async getProviders(
    @Query('provider_type') providerType?: string,
    @Query('is_active') isActive?: string,
  ) {
    return this.providersService.getProviders(
      providerType,
      isActive ? isActive === 'true' : undefined,
    )
  }

  /**
   * Get provider by ID
   */
  @Get(':providerId')
  @RequirePermissions('providers:read')
  async getProviderById(@Param('providerId') providerId: string) {
    return this.providersService.getProviderById(providerId)
  }

  /**
   * Add practice to provider
   */
  @Post(':providerId/practices')
  @RequirePermissions('providers:write')
  async addPractice(
    @Param('providerId') providerId: string,
    @Body() dto: AddPracticeDto,
    @Request() req: any,
  ) {
    return this.providersService.addPractice(providerId, dto, req.user.userId)
  }

  /**
   * Verify provider credential
   */
  @Post(':providerId/credentials/verify')
  @RequirePermissions('providers:write')
  async verifyCredential(
    @Param('providerId') providerId: string,
    @Body() dto: VerifyCredentialDto,
    @Request() req: any,
  ) {
    return this.providersService.verifyCredential(providerId, dto, req.user.userId)
  }

  /**
   * Verify bank account
   */
  @Post(':providerId/bank-accounts/verify')
  @RequirePermissions('providers:write')
  async verifyBankAccount(
    @Param('providerId') providerId: string,
    @Body() dto: VerifyBankAccountDto,
    @Request() req: any,
  ) {
    return this.providersService.verifyBankAccount(providerId, dto, req.user.userId)
  }

  /**
   * Create provider contract
   */
  @Post(':providerId/contracts')
  @RequirePermissions('providers:write')
  async createContract(
    @Param('providerId') providerId: string,
    @Body() dto: CreateContractDto,
    @Request() req: any,
  ) {
    return this.providersService.createContract(providerId, dto, req.user.userId)
  }

  /**
   * Assign provider to network
   */
  @Post(':providerId/networks')
  @RequirePermissions('providers:write')
  async assignNetwork(
    @Param('providerId') providerId: string,
    @Body() dto: AssignNetworkDto,
    @Request() req: any,
  ) {
    return this.providersService.assignNetwork(providerId, dto, req.user.userId)
  }

  /**
   * Grant authorisation to provider
   */
  @Post(':providerId/authorisations')
  @RequirePermissions('providers:write')
  async grantAuthorisation(
    @Param('providerId') providerId: string,
    @Body() dto: GrantAuthorisationDto,
    @Request() req: any,
  ) {
    return this.providersService.grantAuthorisation(providerId, dto, req.user.userId)
  }

  /**
   * Revoke provider authorisation
   */
  @Put('authorisations/:authorisationId/revoke')
  @RequirePermissions('providers:write')
  async revokeAuthorisation(
    @Param('authorisationId') authorisationId: string,
    @Request() req: any,
  ) {
    return this.providersService.revokeAuthorisation(authorisationId, req.user.userId)
  }
}
