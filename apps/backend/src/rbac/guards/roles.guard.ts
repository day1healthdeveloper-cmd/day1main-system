import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RbacService } from '../rbac.service'
import { ROLES_KEY } from '../decorators/require-roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException('User not authenticated')
    }

    // Check if user has any of the required roles
    for (const role of requiredRoles) {
      const hasRole = await this.rbacService.hasRole(user.id, role)
      if (hasRole) {
        return true
      }
    }

    throw new ForbiddenException(`Missing required roles: ${requiredRoles.join(' or ')}`)
  }
}
