import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NetcashController } from './netcash.controller';
import { NetcashService } from './netcash.service';
import { NetcashApiClient } from './netcash-api.client';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';
import { TransactionService } from './transaction.service';
import { TransactionController, FailedPaymentsController } from './transaction.controller';
import { FailedPaymentService } from './failed-payment.service';
import { FailedPaymentController } from './failed-payment.controller';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    SupabaseModule, 
    RbacModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [
    NetcashController, 
    RefundController, 
    TransactionController,
    FailedPaymentsController,
    FailedPaymentController,
    ReconciliationController,
    WebhookController
  ],
  providers: [
    NetcashService, 
    NetcashApiClient, 
    RefundService, 
    TransactionService, 
    FailedPaymentService,
    ReconciliationService,
    WebhookService
  ],
  exports: [
    NetcashService, 
    NetcashApiClient, 
    RefundService, 
    TransactionService, 
    FailedPaymentService,
    ReconciliationService,
    WebhookService
  ],
})
export class NetcashModule {}
