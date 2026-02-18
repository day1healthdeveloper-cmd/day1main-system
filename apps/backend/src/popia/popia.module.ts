import { Module } from '@nestjs/common'
import { PopiaController } from './popia.controller'
import { PopiaService } from './popia.service'
import { DataSubjectRequestService } from './data-subject-request.service'
import { PopiaGuard } from './guards/popia.guard'
import { SupabaseModule } from '../supabase/supabase.module'
import { AuditModule } from '../audit/audit.module'
import { RbacModule } from '../rbac/rbac.module'

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [PopiaController],
  providers: [PopiaService, DataSubjectRequestService, PopiaGuard],
  exports: [PopiaService, DataSubjectRequestService, PopiaGuard],
})
export class PopiaModule {}
