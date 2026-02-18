import { Module } from '@nestjs/common'
import { PoliciesController } from './policies.controller'
import { PoliciesService } from './policies.service'
import { SupabaseModule } from '../supabase/supabase.module'
import { AuditModule } from '../audit/audit.module'
import { RbacModule } from '../rbac/rbac.module'

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [PoliciesController],
  providers: [PoliciesService],
  exports: [PoliciesService],
})
export class PoliciesModule {}
