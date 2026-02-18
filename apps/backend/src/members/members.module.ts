import { Module } from '@nestjs/common'
import { MembersService } from './members.service'
import { MembersController } from './members.controller'
import { SupabaseModule } from '../supabase/supabase.module'
import { AuditModule } from '../audit/audit.module'
import { RbacModule } from '../rbac/rbac.module'

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
