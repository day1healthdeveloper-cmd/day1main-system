import { Module } from '@nestjs/common'
import { RbacService } from './rbac.service'
import { RbacController } from './rbac.controller'
import { SupabaseModule } from '../supabase/supabase.module'
import { PermissionsGuard } from './guards/permissions.guard'

@Module({
  imports: [SupabaseModule],
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard],
})
export class RbacModule {}
