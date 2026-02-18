import { Module, Global } from '@nestjs/common'
import { AuditService } from './audit.service'
import { AuditController } from './audit.controller'
import { SupabaseModule } from '../supabase/supabase.module'
import { RbacModule } from '../rbac/rbac.module'

@Global()
@Module({
  imports: [SupabaseModule, RbacModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
