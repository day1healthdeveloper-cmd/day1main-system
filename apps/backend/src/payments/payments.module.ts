import { Module } from '@nestjs/common';
import { MandateService } from './mandate.service';
import { PaymentProcessingService } from './payment-processing.service';
import { CollectionsService } from './collections.service';
import { PaymentsController } from './payments.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [SupabaseModule, AuditModule, RbacModule],
  controllers: [PaymentsController],
  providers: [MandateService, PaymentProcessingService, CollectionsService],
  exports: [MandateService, PaymentProcessingService, CollectionsService],
})
export class PaymentsModule {}
