import { Module } from '@nestjs/common'
import { PmbService } from './pmb.service'
import { PmbController } from './pmb.controller'
import { SupabaseModule } from '../supabase/supabase.module'
import { AuditModule } from '../audit/audit.module'
import { RbacModule } from '../rbac/rbac.module'

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [PmbController],
  providers: [PmbService],
  exports: [PmbService],
})
export class PmbModule {}
