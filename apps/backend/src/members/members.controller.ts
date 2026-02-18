import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { MembersService } from './members.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../rbac/guards/permissions.guard'
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import {
  RegisterMemberDto,
  UpdateMemberDto,
  AddDependantDto,
  CaptureConsentDto,
} from './dto'

@Controller('members')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Post()
  @RequirePermissions('member:write')
  async registerMember(@Body() dto: RegisterMemberDto, @CurrentUser() user: any) {
    return this.membersService.registerMember(dto, user.id)
  }

  @Get()
  @RequirePermissions('member:read')
  async listMembers(@Query('skip') skip?: string, @Query('take') take?: string) {
    const skipNum = skip ? parseInt(skip, 10) : 0
    const takeNum = take ? parseInt(take, 10) : 50
    return this.membersService.listMembers(skipNum, takeNum)
  }

  @Get(':id')
  @RequirePermissions('member:read')
  async getMember(@Param('id') id: string) {
    return this.membersService.getMember(id)
  }

  @Put(':id')
  @RequirePermissions('member:write')
  async updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.membersService.updateMember(id, dto, user.id)
  }

  @Post(':id/dependants')
  @RequirePermissions('member:write')
  async addDependant(
    @Param('id') id: string,
    @Body() dto: AddDependantDto,
    @CurrentUser() user: any,
  ) {
    return this.membersService.addDependant(id, dto, user.id)
  }

  @Post(':id/consents')
  @RequirePermissions('member:write')
  async captureConsent(
    @Param('id') id: string,
    @Body() dto: CaptureConsentDto,
    @CurrentUser() user: any,
  ) {
    return this.membersService.captureConsent(id, dto, user.id)
  }

  @Get(':id/consents')
  @RequirePermissions('member:read')
  async getMemberConsents(@Param('id') id: string) {
    return this.membersService.getMemberConsents(id)
  }

  @Delete('consents/:consentId')
  @RequirePermissions('member:write')
  async revokeConsent(@Param('consentId') consentId: string, @CurrentUser() user: any) {
    return this.membersService.revokeConsent(consentId, user.id)
  }
}
