import { Module } from '@nestjs/common'
import { RegimeService } from './regime.service'
import { UnderwritingService } from './underwriting.service'
import { RegimeController } from './regime.controller'
import { SupabaseModule } from '../supabase/supabase.module'
import { AuditModule } from '../audit/audit.module'
import { RbacModule } from '../rbac/rbac.module'

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [RegimeController],
  providers: [RegimeService, UnderwritingService],
  exports: [RegimeService, UnderwritingService],
})
export class RegimeModule {}
