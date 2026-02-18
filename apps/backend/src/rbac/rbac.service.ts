import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class RbacService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient()
  }

  /**
   * Assign a role to a user
   */
  async assignRole(userId: string, roleId: string, assignedBy?: string) {
    // Check if role exists
    const { data: role, error: roleError } = await this.supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single()

    if (roleError || !role) {
      throw new NotFoundException('Role not found')
    }

    // Check if user already has this role
    const { data: existing } = await this.supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single()

    if (existing) {
      return { message: 'User already has this role' }
    }

    // Assign role
    await this.supabase.from('user_roles').insert({
      user_id: userId,
      role_id: roleId,
      assigned_by: assignedBy,
    })

    // Log audit event
    if (assignedBy) {
      await this.supabase.from('audit_events').insert({
        event_type: 'rbac',
        entity_type: 'user_role',
        entity_id: userId,
        user_id: assignedBy,
        action: 'role_assigned',
        metadata: {
          target_user_id: userId,
          role_id: roleId,
          role_name: role.name,
        },
      })
    }

    return { message: 'Role assigned successfully', role: role.name }
  }

  /**
   * Revoke a role from a user
   */
  async revokeRole(userId: string, roleId: string, revokedBy?: string) {
    // Check if user has this role
    const { data: userRole, error } = await this.supabase
      .from('user_roles')
      .select('*, role:roles(*)')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single()

    if (error || !userRole) {
      throw new NotFoundException('User does not have this role')
    }

    // Delete user role
    await this.supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)

    // Log audit event
    if (revokedBy) {
      await this.supabase.from('audit_events').insert({
        event_type: 'rbac',
        entity_type: 'user_role',
        entity_id: userId,
        user_id: revokedBy,
        action: 'role_revoked',
        metadata: {
          target_user_id: userId,
          role_id: roleId,
          role_name: userRole.role?.name,
        },
      })
    }

    return { message: 'Role revoked successfully' }
  }


  /**
   * Check if user has a specific permission
   */
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const { data: userRoles } = await this.supabase
      .from('user_roles')
      .select(`
        role:roles(
          role_permissions(
            permission:permissions(name)
          )
        )
      `)
      .eq('user_id', userId)

    if (!userRoles) return false

    for (const userRole of userRoles) {
      const rolePermissions = (userRole.role as any)?.role_permissions || []
      const hasPermission = rolePermissions.some(
        (rp: any) => rp.permission?.name === permission
      )
      if (hasPermission) return true
    }

    return false
  }

  /**
   * Check if user has any of the specified permissions
   */
  async checkAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.checkPermission(userId, permission)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if user has all of the specified permissions
   */
  async checkAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.checkPermission(userId, permission))) {
        return false
      }
    }
    return true
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string) {
    const { data: userRoles } = await this.supabase
      .from('user_roles')
      .select(`
        role:roles(
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)

    return userRoles?.map((ur: any) => ur.role) || []
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: string) {
    const { data: rolePermissions } = await this.supabase
      .from('role_permissions')
      .select(`
        permission:permissions(
          id,
          name,
          description,
          resource,
          action
        )
      `)
      .eq('role_id', roleId)

    return rolePermissions?.map((rp: any) => rp.permission) || []
  }

  /**
   * Get all permissions for a user (across all roles)
   */
  async getUserPermissions(userId: string) {
    const { data: userRoles } = await this.supabase
      .from('user_roles')
      .select(`
        role:roles(
          role_permissions(
            permission:permissions(
              id,
              name,
              description,
              resource,
              action
            )
          )
        )
      `)
      .eq('user_id', userId)

    const permissionsMap = new Map()
    
    if (userRoles) {
      for (const userRole of userRoles) {
        const rolePermissions = (userRole.role as any)?.role_permissions || []
        for (const rolePermission of rolePermissions) {
          const perm = rolePermission.permission
          if (perm && !permissionsMap.has(perm.id)) {
            permissionsMap.set(perm.id, perm)
          }
        }
      }
    }

    return Array.from(permissionsMap.values())
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const { count } = await this.supabase
      .from('user_roles')
      .select('*, role:roles!inner(name)', { count: 'exact' })
      .eq('user_id', userId)
      .eq('role.name', roleName)

    return (count || 0) > 0
  }

  /**
   * Enforce permission check - throws exception if user doesn't have permission
   */
  async enforcePermission(userId: string, permission: string) {
    const hasPermission = await this.checkPermission(userId, permission)
    
    if (!hasPermission) {
      throw new ForbiddenException(`Missing required permission: ${permission}`)
    }
  }

  /**
   * Enforce role check - throws exception if user doesn't have role
   */
  async enforceRole(userId: string, roleName: string) {
    const hasRole = await this.hasRole(userId, roleName)
    
    if (!hasRole) {
      throw new ForbiddenException(`Missing required role: ${roleName}`)
    }
  }

  /**
   * Get all available roles
   */
  async getAllRoles() {
    const { data: roles } = await this.supabase
      .from('roles')
      .select('id, name, description, created_at')
      .order('name', { ascending: true })

    return roles || []
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions() {
    const { data: permissions } = await this.supabase
      .from('permissions')
      .select('id, name, description, resource, action')
      .order('resource', { ascending: true })

    return permissions || []
  }
}