import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RbacService } from '../rbac.service'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    console.log('🔐 PermissionsGuard: Required permissions:', requiredPermissions);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('🔐 PermissionsGuard: No permissions required, allowing access');
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    console.log('🔐 PermissionsGuard: User:', user ? `ID: ${user.id}` : 'null');

    if (!user) {
      console.log('🔐 PermissionsGuard: User not authenticated, throwing ForbiddenException');
      throw new ForbiddenException('User not authenticated')
    }

    // Check if user has any of the required permissions
    console.log('🔐 PermissionsGuard: Checking permissions for user:', user.id);
    const hasPermission = await this.rbacService.checkAnyPermission(user.id, requiredPermissions)

    console.log('🔐 PermissionsGuard: Has permission:', hasPermission);

    if (!hasPermission) {
      console.log('🔐 PermissionsGuard: Missing permissions, throwing ForbiddenException');
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(' or ')}`,
      )
    }

    console.log('🔐 PermissionsGuard: Access granted');
    return true
  }
}
