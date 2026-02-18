import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { RbacService } from './rbac.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { PermissionsGuard } from './guards/permissions.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AssignRoleDto, RevokeRoleDto } from './dto'

@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Get('roles')
  @RequirePermissions('system:admin')
  async getAllRoles() {
    return this.rbacService.getAllRoles()
  }

  @Get('permissions')
  @RequirePermissions('system:admin')
  async getAllPermissions() {
    return this.rbacService.getAllPermissions()
  }

  @Get('users/:userId/roles')
  @RequirePermissions('system:admin', 'member:read')
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId)
  }

  @Get('users/:userId/permissions')
  @RequirePermissions('system:admin', 'member:read')
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId)
  }

  @Get('roles/:roleId/permissions')
  @RequirePermissions('system:admin')
  async getRolePermissions(@Param('roleId') roleId: string) {
    return this.rbacService.getRolePermissions(roleId)
  }

  @Post('users/:userId/roles')
  @RequirePermissions('system:admin')
  async assignRole(
    @Param('userId') userId: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.rbacService.assignRole(userId, dto.role_id, user.id)
  }

  @Delete('users/:userId/roles/:roleId')
  @RequirePermissions('system:admin')
  async revokeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: any,
  ) {
    return this.rbacService.revokeRole(userId, roleId, user.id)
  }

  @Get('me/roles')
  async getMyRoles(@CurrentUser() user: any) {
    return this.rbacService.getUserRoles(user.id)
  }

  @Get('me/permissions')
  async getMyPermissions(@CurrentUser() user: any) {
    return this.rbacService.getUserPermissions(user.id)
  }
}
