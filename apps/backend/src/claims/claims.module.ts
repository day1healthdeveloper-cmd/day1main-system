import { Module } from '@nestjs/common'
import { ClaimsService } from './claims.service'
import { AdjudicationService } from './adjudication.service'
import { FraudDetectionService } from './fraud-detection.service'
import { PreAuthService } from './preauth.service'
import { AppealsService } from './appeals.service'
import { PaymentService } from './payment.service'
import { ClaimsController } from './claims.controller'
import { SupabaseModule } from '../supabase/supabase.module'
import { AuditModule } from '../audit/audit.module'
import { PoliciesModule } from '../policies/policies.module'
import { RulesModule } from '../rules/rules.module'
import { PmbModule } from '../pmb/pmb.module'
import { RbacModule } from '../rbac/rbac.module'

@Module({
  imports: [SupabaseModule, AuditModule, PoliciesModule, RulesModule, PmbModule, RbacModule],
  controllers: [ClaimsController],
  providers: [
    ClaimsService,
    AdjudicationService,
    FraudDetectionService,
    PreAuthService,
    AppealsService,
    PaymentService,
  ],
  exports: [
    ClaimsService,
    AdjudicationService,
    FraudDetectionService,
    PreAuthService,
    AppealsService,
    PaymentService,
  ],
})
export class ClaimsModule {}
